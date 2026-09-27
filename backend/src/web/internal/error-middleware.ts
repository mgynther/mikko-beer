import type Koa from 'koa'

import type { ErrorHandler } from '../error-response.js'

export function createErrorMiddleware(
  handleError: ErrorHandler,
): Koa.Middleware {
  return async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
  ): Promise<void> => {
    try {
      await next()
    } catch (error) {
      const response = handleError(error)
      ctx.status = response.status
      ctx.body = response.body
    }
  }
}
