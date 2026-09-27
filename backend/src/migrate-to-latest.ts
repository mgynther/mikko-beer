import { consoleLog as log } from './console/console-log.js'

import { migrateToLatest } from './data/migrate-to-latest.js'
import { createMigrationFailureHandler } from './data/migration-failure-handler.js'

migrateToLatest(log).then(
  () => {
    log('INFO', 'migration done')
  },
  createMigrationFailureHandler(log, process),
)
