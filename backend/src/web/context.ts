import type { Config } from './config'

import type { log } from '../core/log'
import type { Database } from '../data/database'
import type { IncomingHttpHeaders } from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'

interface Request {
  body: unknown
  query: ParsedUrlQuery
}

export interface Context {
  db: Database
  config: Config
  headers: IncomingHttpHeaders
  log: log
  params: Record<string, string>
  request: Request
}
