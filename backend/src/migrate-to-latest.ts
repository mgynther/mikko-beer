import { consoleLog as log } from './console/console-log.js'
import { Level } from './console/log.js'

import { migrateToLatest } from './data/migrate-to-latest.js'

try {
  migrateToLatest(log).then(
    () => {
      log(Level.INFO, 'migration done')
    },
    () => {
      log(Level.WARN, 'migration promise rejected')
    },
  )
} catch (e) {
  log(Level.WARN, 'error running migration', e)
}
