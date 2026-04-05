import type { Config } from './config.js'

import type { log } from '../core/log.js'
import type { Database } from '../data/database.js'

interface Request {
  body: unknown
  query: Record<string, string>
}

interface Headers {
  authorization: string | undefined
}

export interface Context {
  db: Database
  config: Config
  headers: Headers
  log: log
  params: Record<string, string>
  request: Request
}
