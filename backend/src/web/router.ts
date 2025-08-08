import * as KoaRouter from '@koa/router'

import type { ContextExtension } from './context'

export class Router extends KoaRouter<unknown, ContextExtension> {}
