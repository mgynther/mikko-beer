import { Router as KoaRouter } from '@koa/router'

import type { ContextExtension } from './context'
import type { DefaultState } from 'koa'

export class Router extends KoaRouter<DefaultState, ContextExtension> {}
