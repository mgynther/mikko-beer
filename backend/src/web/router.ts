import type * as Koa from 'koa'
import { Router as KoaRouter } from '@koa/router'
import type { RouterContext as KoaRouterContext } from '@koa/router'
import type { ParsedUrlQuery } from 'node:querystring'

import type { Context } from './context'
import type { Database } from '../data/database'
import type { Config } from './config'
import type { log } from '../core/log'
import { invalidQueryError } from '../core/errors'

export interface Response {
  status: 200 | 201 | 204
  body: Record<string, unknown> | undefined
}

type RequestHandler = (context: Context) => Promise<Response>

export interface Router {
  get: (path: string, handler: RequestHandler) => void
  delete: (path: string, handler: RequestHandler) => void
  post: (path: string, handler: RequestHandler) => void
  put: (path: string, handler: RequestHandler) => void
}

interface RouterParams {
  db: Database
  config: Config
  log: log
}

interface CreatedRouter {
  useRouter: (koa: Koa<unknown, unknown>) => void
  router: Router
}

export function createRouter(routerParams: RouterParams): CreatedRouter {
  const koaRouter = new KoaRouter();

  const router: Router = {
    get: (path: string, handler: RequestHandler) => {
      koaRouter.get(path, async (koaContext) => {
        await koaHandler(koaContext, handler, routerParams)
      })
    },
    delete: (path: string, handler: RequestHandler) => {
      koaRouter.delete(path, async (koaContext) => {
        await koaHandler(koaContext, handler, routerParams)
      })
    },
    post: (path: string, handler: RequestHandler) => {
      koaRouter.post(path, async (koaContext) => {
        await koaHandler(koaContext, handler, routerParams)
      })
    },
    put: (path: string, handler: RequestHandler) => {
      koaRouter.put(path, async (koaContext) => {
        await koaHandler(koaContext, handler, routerParams)
      })
    },
  }

  return {
    useRouter: (koa: Koa<unknown, unknown>) => {
      koa.use(koaRouter.routes())
      koa.use(koaRouter.allowedMethods())
    },
    router
  }
}

async function koaHandler (
  koaContext: KoaRouterContext,
  handler: RequestHandler,
  routerParams: RouterParams
): Promise<void> {
  const response = await handler({
    ...routerParams,
    headers: { authorization: koaContext.headers.authorization },
    params: koaContext.params,
    request: {
      body: koaContext.request.body,
      query: parseQuery(koaContext.request.query)
    }
  });
  koaContext.status = response.status
  koaContext.body = response.body
}

function parseQuery(koaQuery: ParsedUrlQuery): Record<string, string> {
  const result: Record<string, string> = {}
  Object.keys(koaQuery).forEach(key => {
    const value = koaQuery[key]
    if (typeof value !== 'string') {
      throw invalidQueryError
    }
    result[key] = value
  })
  return result
}
