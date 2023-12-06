import * as path from 'path'
import { promises as fs } from 'fs'
import { type Database } from './database'
import { config } from './config'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider
} from 'kysely'
import { Pool } from 'pg'

async function migrateToLatest (): Promise<void> {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool(config)
    })
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations')
    })
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error !== undefined) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

try {
  migrateToLatest().then(() => {
    console.log('migration done')
  }, () => { console.warn('migration promise rejected') })
} catch (e) {
  console.warn('error running migration', e)
}
