import {
  Kysely,
  PostgresDialect,
  sql,
} from 'kysely'
import { ConnectionConfig, Pool } from 'pg'
import { Database } from '../../src/data/database'

import {
  FileMigrationProvider,
  Migrator,
} from 'kysely'
import * as path from 'path'
import { promises as fs } from 'fs'

export async function beforeTests(
  config: ConnectionConfig,
  adminConfig: ConnectionConfig
) {
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
      migrationFolder: path.join(__dirname, '../../src/data/migrations'),
    }),
  })

  await migrator.migrateToLatest()
  await db.destroy()
}

export async function afterTests() {
}

export async function beforeTest(db: Database) {
  await clearDb(db)
}

export async function afterTest() {
}

async function clearDb(db: Database) {
  const realDb = db.getDb()
  await realDb.deleteFrom('review').execute()
  await realDb.deleteFrom('storage').execute()
  await realDb.deleteFrom('beer_brewery').execute()
  await realDb.deleteFrom('beer_style').execute()
  await realDb.deleteFrom('beer').execute()
  await realDb.deleteFrom('brewery').execute()
  await realDb.deleteFrom('container').execute()
  await realDb.deleteFrom('style_relationship').execute()
  await realDb.deleteFrom('style').execute()
  await realDb.deleteFrom('user').execute()
}
