import type * as Koa from 'koa'
import type * as KoaRouter from 'koa-router'

import type { Config } from './config'

import type { log } from '../core/log'
import type { Database } from '../data/database'

export interface ContextExtension {
  db: Database,
  config: Config,
  log: log
}

export type Context = Koa.ParameterizedContext<
unknown,
ContextExtension & KoaRouter.IRouterParamContext<unknown, ContextExtension>
>
