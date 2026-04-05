import type { Context } from '../context.js'

import { parseAuthTokenPayload } from '../../core/auth/authentication.js'
import type { AuthTokenPayload } from '../../core/auth/auth-token.js'

import * as refreshTokenRepository
from '../../data/authentication/refresh-token.repository.js'
import type { Database } from '../../data/database.js'
import type { DbRefreshToken } from '../../core/auth/refresh-token.js'

export function createFindRefreshToken(db: Database) {
  return async (
    userId: string,
    refreshTokenId: string
  ): Promise<DbRefreshToken | undefined> =>
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
