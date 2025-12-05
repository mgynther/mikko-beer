import type * as Koa from 'koa'
import type { RouterContext } from '@koa/router'

import type { Config } from './config'

import type { log } from '../core/log'
import type { Database } from '../data/database'

export interface ContextExtension {
  db: Database,
  config: Config,
  log: log
}

type ContextState = object

export type Context = Koa.ParameterizedContext<
ContextState,
ContextExtension & RouterContext<ContextState, ContextExtension>
>
