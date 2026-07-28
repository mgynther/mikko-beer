import { consoleLog as log } from './console/console-log.js'

import { migrateToLatest } from './data/migrate-to-latest.js'

try {
  migrateToLatest(log).then(
    () => {
      log('INFO', 'migration done')
    },
    () => {
      log('WARN', 'migration promise rejected')
    },
  )
} catch (e) {
  log('WARN', 'error running migration', e)
}
