import type * as Koa from 'koa'
import type * as KoaRouter from 'koa-router'

import { type Config } from './config'

import { type Database } from '../data/database'

export interface ContextExtension {
  db: Database,
  config: Config,
}

export type Context = Koa.ParameterizedContext<
any,
ContextExtension & KoaRouter.IRouterParamContext<any, ContextExtension>,
any
>
