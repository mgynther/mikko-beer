import Koa from 'koa'
import compress from 'koa-compress'
import { bodyParser } from '@koa/bodyparser'
import { once } from 'node:events'
import type { Server } from 'node:http'

import type { ErrorHandler } from './error-response.js'
import { createErrorMiddleware } from './internal/error-middleware.js'
import { addHeaders } from './internal/headers.js'
import type { Api } from './api.js'
import { createRouter } from './internal/router.js'
import { registerRoutes } from './internal/routes.js'
import { createStopHandler } from './internal/stop-handler.js'

export interface WebServer {
  listen: (port: number) => Promise<void>
  close: () => Promise<void>
}

export interface WebErrors {
  // Answers whatever a handler, or rejectRepeatedQueryParameter, threw.
  handle: ErrorHandler
  // Throws the error a request with a repeated query parameter is answered
  // with.
  rejectRepeatedQueryParameter: () => never
}

export function createWebServer(api: Api, errors: WebErrors): WebServer {
  const koa = new Koa()
  koa.use(compress())
  koa.use(bodyParser())
  koa.use(addHeaders)
  koa.use(createErrorMiddleware(errors.handle))

  const { router, useRouter } = createRouter(
    errors.rejectRepeatedQueryParameter,
  )
  registerRoutes(router, api)
  useRouter(koa)

  let server: Server | undefined
  return {
    listen: async (port: number): Promise<void> => {
      const listening = koa.listen(port)
      // once rather than a listen callback and an error listener of our own:
      // it rejects on the error too, and leaves no listener behind that would
      // swallow a later error of the running server.
      await once(listening, 'listening')
      server = listening
    },
    close: async (): Promise<void> => {
      await new Promise<void>((resolve, reject): void => {
        if (server === undefined) {
          resolve()
        } else {
          server.close(createStopHandler(resolve, reject))
        }
      })
    },
  }
}
