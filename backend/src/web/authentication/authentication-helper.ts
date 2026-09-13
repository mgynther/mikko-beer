import type { Context } from '../context.js'

import { parseAuthTokenPayload } from '../../logic/auth/authentication.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'

import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository.js'
import type { Database } from '../../data/database.js'
import type { DbRefreshToken } from '../../logic/auth/refresh-token.js'
import { jwtIf } from './jwt-helper.js'

export function createFindRefreshToken(db: Database) {
  return async (
    userId: string,
    refreshTokenId: string,
  ): Promise<DbRefreshToken | undefined> =>
    await refreshTokenRepository.findRefreshToken(db, userId, refreshTokenId)
}

export function parseAuthToken(ctx: Context): AuthTokenPayload {
  const authorization = ctx.headers.authorization
  return parseAuthTokenPayload(jwtIf, authorization, ctx.config.authTokenSecret)
}
