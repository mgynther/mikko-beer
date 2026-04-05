import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from 'node:fs'
import type { Database } from './database.js'
import { config } from './config.js'
import { consoleLog as log } from '../core/console-log.js'
import { Level } from '../core/log.js'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider
} from 'kysely'
import { Pool } from 'pg'

const directory = dirname(fileURLToPath(import.meta.url));

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
      migrationFolder: path.join(directory, 'migrations')
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
