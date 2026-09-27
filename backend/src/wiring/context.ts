import type { Config } from './config.js'

import type { log } from '../console/log.js'
import type { Database } from '../data/database.js'

// What every handler needs, closed over rather than carried on a request.
export interface Context {
  db: Database
  config: Config
  log: log
}
