import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'

import type { DatabaseConfig } from '../../src/data/database-config.js'
import { Database } from '../../src/data/database.js'
import type { KyselyDatabase } from '../../src/data/database.js'

import { FileMigrationProvider, Migrator } from 'kysely/migration'
import * as path from 'path'
import { promises as fs } from 'fs'

const directory = dirname(fileURLToPath(import.meta.url))

// Tests run in a single process with --test-isolation=none, so the schema
// created for the first test file is still valid for the rest of them. Only
// tests that migrate the schema themselves need a rebuild, which they request
// with invalidateSchema.
let schemaReady: Promise<void> | undefined

export function invalidateSchema(): void {
  schemaReady = undefined
}

export async function beforeTests(
  config: DatabaseConfig,
  adminConfig: DatabaseConfig,
): Promise<void> {
  schemaReady ??= createSchema(config, adminConfig)
  await schemaReady
}

async function createSchema(
  config: DatabaseConfig,
  adminConfig: DatabaseConfig,
): Promise<void> {
  const adminDb = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool(adminConfig),
    }),
  })

  const { database } = config
  await sql`drop database if exists ${sql.id(database!)}`.execute(adminDb)
  await sql`create database ${sql.id(database!)}`.execute(adminDb)
  await adminDb.destroy()

  const db = new Database(config)

  const migrator = new Migrator({
    db: db.getDb(),
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(directory, '../../src/data/migrations'),
    }),
  })

  await migrator.migrateToLatest()
  await db.destroy()
}

export async function afterTests(): Promise<void> {}

export async function beforeTest(db: Database): Promise<void> {
  await clearDb(db)
}

export async function afterTest(): Promise<void> {}

// Ordered so that referencing rows are deleted before referenced ones. Rows
// that reference a user are removed by the cascade of deleting the user.
const clearedTables: (keyof KyselyDatabase)[] = [
  'review',
  'storage',
  'beer_brewery',
  'beer_style',
  'beer',
  'brewery',
  'location',
  'container',
  'style_relationship',
  'style',
  'user',
]

// One round trip instead of one per table. Truncate would be an alternative
// but is an order of magnitude slower for the small row counts of tests.
const clearDbQuery = clearedTables
  .map((table: keyof KyselyDatabase) => `delete from "${table}"`)
  .join('; ')

async function clearDb(db: Database): Promise<void> {
  await sql.raw(clearDbQuery).execute(db.getDb())
}
