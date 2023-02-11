import type * as Koa from 'koa'
import type * as KoaRouter from 'koa-router'

import { type Kysely } from 'kysely'
import { type Database } from './database'

export interface ContextExtension {
  db: Kysely<Database>
}

export type Context = Koa.ParameterizedContext<
any,
ContextExtension & KoaRouter.IRouterParamContext<any, ContextExtension>,
any
>
