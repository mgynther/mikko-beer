import { type Context } from '../context'

import * as authService from '../../core/authentication/authentication.service'
import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository'
import type { AuthTokenPayload } from '../../core/authentication/auth-token'
import type { Database } from '../../data/database'

export function createFindRefreshToken(db: Database) {
  return (userId: string, refreshTokenId: string) => {
    return refreshTokenRepository.findRefreshToken(
      db,
      userId,
      refreshTokenId
    )
  }
}

export function parseAuthToken (
  ctx: Context
): AuthTokenPayload {
  const authorization = ctx.headers.authorization
  return authService.parseAuthTokenPayload(authorization, ctx.config.authTokenSecret)
}
