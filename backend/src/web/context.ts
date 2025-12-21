import type { Config } from './config'

import type { log } from '../core/log'
import type { Database } from '../data/database'

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
