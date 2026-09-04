import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Kysely, PostgresDialect, sql } from 'kysely'
import type { ConnectionConfig } from 'pg'
import { Pool } from 'pg'
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
let isSchemaReady = false

export function invalidateSchema() {
  isSchemaReady = false
}

export async function beforeTests(
  config: ConnectionConfig,
  adminConfig: ConnectionConfig,
  // Initializing data here can be relevant only when App needs to start with
  // specific data. For other purposes getting database from the is more
  // suitable.
  dataInitializer?: (db: Database) => Promise<void>,
) {
  // Data initialization has to run against a database that no previous test
  // file has left rows in, so it always gets a fresh database.
  if (isSchemaReady && dataInitializer === undefined) {
    return
  }

  const adminDb = new Kysely<any>({
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
  if (dataInitializer !== undefined) {
    await dataInitializer(db)
  }
  await db.destroy()
  isSchemaReady = true
}

export async function afterTests() {}

export async function beforeTest(db: Database) {
  await clearDb(db)
}

export async function afterTest() {}

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

async function clearDb(db: Database) {
  await sql.raw(clearDbQuery).execute(db.getDb())
}
