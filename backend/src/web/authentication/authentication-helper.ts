import { type Next } from 'koa'

import { type Context } from '../context'

import * as authService from '../../core/authentication/authentication.service'
import * as refreshTokenRepository
  from '../../data/authentication/refresh-token.repository'
import { AuthTokenPayload } from '../../core/authentication/auth-token'

export async function authenticateUser (
  ctx: Context,
  next: Next
): Promise<void> {
  const { userId } = ctx.params
  const authorizationHeader = ctx.headers.authorization
  const findRefreshToken = (userId: string, refreshTokenId: string) => {
    return refreshTokenRepository.findRefreshToken(
      ctx.db,
      userId,
      refreshTokenId
    )
  }
  await authService.authenticateUser(
    userId,
    authorizationHeader,
    ctx.config.authTokenSecret,
    findRefreshToken
  )
  return await next()
}

export async function authenticateAdmin (
  ctx: Context,
  next: Next
): Promise<void> {
  const authorization = ctx.headers.authorization
  authService.authenticateAdmin(authorization, ctx.config.authTokenSecret)
  return await next()
}

export async function authenticateViewer (
  ctx: Context,
  next: Next
): Promise<void> {
  const authorization = ctx.headers.authorization
  authService.authenticateViewer(authorization, ctx.config.authTokenSecret)
  return await next()
}

export function parseAuthToken (
  ctx: Context
): AuthTokenPayload {
  const authorization = ctx.headers.authorization
  return authService.parseAuthTokenPayload(authorization, ctx.config.authTokenSecret)
}
