import * as path from 'path'
import { promises as fs } from 'fs'
import type { Database } from './database'
import { config } from './config'
import { consoleLog as log } from '../core/console-log'
import { Level } from '../core/log'
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
      log(
        Level.INFO,
        `migration "${it.migrationName}" was executed successfully`
      )
    } else if (it.status === 'Error') {
      log(Level.ERROR, `failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error !== undefined) {
    log(Level.ERROR, 'failed to migrate')
    log(Level.ERROR, error)
    process.exit(1)
  }

  await db.destroy()
}

try {
  migrateToLatest().then(() => {
    log(Level.INFO, 'migration done')
  }, () => { log(Level.WARN, 'migration promise rejected') })
} catch (e) {
  log(Level.WARN, 'error running migration', e)
}
