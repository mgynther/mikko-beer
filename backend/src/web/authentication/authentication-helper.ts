import type { Context } from '../context'

import { parseAuthTokenPayload } from '../../core/auth/authentication'
import type { AuthTokenPayload } from '../../core/auth/auth-token'

import * as refreshTokenRepository
from '../../data/authentication/refresh-token.repository'
import type { Database } from '../../data/database'

export function createFindRefreshToken(db: Database) {
  return async (userId: string, refreshTokenId: string) =>
    await refreshTokenRepository.findRefreshToken(
      db,
      userId,
      refreshTokenId
    )
}

export function parseAuthToken (
  ctx: Context
): AuthTokenPayload {
  const authorization = ctx.headers.authorization
  return parseAuthTokenPayload(authorization, ctx.config.authTokenSecret)
}
