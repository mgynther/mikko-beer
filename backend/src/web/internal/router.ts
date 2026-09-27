import type Koa from 'koa'
import { Router as KoaRouter } from '@koa/router'
import type { RouterContext as KoaRouterContext } from '@koa/router'

import { singleValues } from './query.js'

export interface RouteRequest {
  authorization: string | undefined
  params: Record<string, string>
  query: Record<string, string | undefined>
  body: unknown
}

type Status = 200 | 201 | 204

// The body a route answers with. The router cannot know its shape, so the
// route states it in its return type.
type RouteHandler = (request: RouteRequest) => Promise<object | undefined>

export interface Router {
  get: (path: string, status: Status, handler: RouteHandler) => void
  delete: (path: string, status: Status, handler: RouteHandler) => void
  post: (path: string, status: Status, handler: RouteHandler) => void
  put: (path: string, status: Status, handler: RouteHandler) => void
}

interface Answer {
  status: Status
  body: object | undefined
}

type Respond = (request: RouteRequest) => Promise<Answer>

type Method = 'get' | 'delete' | 'post' | 'put'

interface CreatedRouter {
  useRouter: (koa: Koa) => void
  router: Router
}

export function createRouter(
  rejectRepeatedQueryParameter: () => never,
): CreatedRouter {
  const koaRouter = new KoaRouter()

  function register(method: Method, path: string, respond: Respond): void {
    const middleware = async (koaContext: KoaRouterContext): Promise<void> => {
      await koaHandler(koaContext, respond, rejectRepeatedQueryParameter)
    }
    switch (method) {
      case 'get':
        koaRouter.get(path, middleware)
        break
      case 'delete':
        koaRouter.delete(path, middleware)
        break
      case 'post':
        koaRouter.post(path, middleware)
        break
      case 'put':
        koaRouter.put(path, middleware)
        break
    }
  }

  function withStatus(status: Status, handler: RouteHandler): Respond {
    return async (request: RouteRequest): Promise<Answer> => ({
      status,
      body: await handler(request),
    })
  }

  const router: Router = {
    get: (path: string, status: Status, handler: RouteHandler): void => {
      register('get', path, withStatus(status, handler))
    },
    delete: (path: string, status: Status, handler: RouteHandler): void => {
      register('delete', path, withStatus(status, handler))
    },
    post: (path: string, status: Status, handler: RouteHandler): void => {
      register('post', path, withStatus(status, handler))
    },
    put: (path: string, status: Status, handler: RouteHandler): void => {
      register('put', path, withStatus(status, handler))
    },
  }

  return {
    useRouter: (koa: Koa): void => {
      koa.use(koaRouter.routes())
      koa.use(koaRouter.allowedMethods())
    },
    router,
  }
}

async function koaHandler(
  koaContext: KoaRouterContext,
  respond: Respond,
  rejectRepeatedQueryParameter: () => never,
): Promise<void> {
  const answer = await respond({
    authorization: koaContext.headers.authorization,
    params: koaContext.params,
    query: singleValues(koaContext.request.query, rejectRepeatedQueryParameter),
    body: koaContext.request.body,
  })
  /* eslint-disable-next-line require-atomic-updates --
   * koa requires assigning properties and there's no way to do it before
   * handling the request. Context is not outdated here.
   */
  koaContext.status = answer.status
  /* eslint-disable-next-line require-atomic-updates --
   * koa requires assigning properties and there's no way to do it before
   * handling the request. Context is not outdated here.
   */
  koaContext.body = answer.body
}
