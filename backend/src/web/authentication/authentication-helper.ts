import { type Next } from 'koa'

import { type Context } from '../context'

import * as authService from '../authentication/authentication.service'

export async function authenticateAdmin (
  ctx: Context,
  next: Next
): Promise<void> {
  const authorization = ctx.headers.authorization
  authService.authenticateAdmin(authorization)
  return await next()
}

export async function authenticateViewer (
  ctx: Context,
  next: Next
): Promise<void> {
  const authorization = ctx.headers.authorization
  authService.authenticateViewer(authorization)
  return await next()
}
