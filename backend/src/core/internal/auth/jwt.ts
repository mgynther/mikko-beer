// This file wraps jsonwebtoken usage to core types.
import * as jwt from 'jsonwebtoken'
import { Role } from '../../user/user'
import type {
  AuthToken,
  AuthTokenConfig, AuthTokenPayload
} from '../../auth/auth-token'
import {
  AuthTokenExpiredError, InvalidAuthTokenError
} from '../../auth/auth-token'

import type { RefreshToken } from '../../auth/refresh-token'

export interface RefreshTokenPayload {
  userId: string
  refreshTokenId: string
  isRefreshToken: true
}

export function signAuthToken (
  tokenPayload: AuthTokenPayload,
  authTokenConfig: AuthTokenConfig
): AuthToken {
  return {
    authToken: jwt.sign(tokenPayload, authTokenConfig.secret, {
      expiresIn: `${authTokenConfig.expiryDurationMin}m`
    })
  }
}

export function signRefreshToken (
  tokenPayload: RefreshTokenPayload,
  authTokenSecret: string
): RefreshToken {
  // Refresh tokens never expire.
  return { refreshToken: jwt.sign(tokenPayload, authTokenSecret) }
}

export function verifyAuthToken (
  token: AuthToken,
  authTokenSecret: string
): AuthTokenPayload {
  const payload = verifyToken(token.authToken, authTokenSecret)
  if (
    typeof payload === 'string' ||
    typeof payload.userId !== 'string' ||
    typeof payload.role !== 'string' ||
    typeof payload.refreshTokenId !== 'string'
  ) {
    throw new InvalidAuthTokenError()
  }

  const {role} = payload
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison --
   * Validation requires unsafe comparison.
   */
  if (role !== Role.admin && role !== Role.viewer) {
    throw new InvalidAuthTokenError()
  }

  return {
    userId: payload.userId,
    role: role as Role,
    refreshTokenId: payload.refreshTokenId
  }
}

export function verifyRefreshToken (
  token: RefreshToken,
  authTokenSecret: string
): RefreshTokenPayload {
  const payload = verifyToken(token.refreshToken, authTokenSecret)

  if (
    typeof payload === 'string' ||
    typeof payload.userId !== 'string' ||
    typeof payload.refreshTokenId !== 'string' ||
    payload.isRefreshToken !== true
  ) {
    throw new InvalidAuthTokenError()
  }

  return {
    userId: payload.userId,
    refreshTokenId: payload.refreshTokenId,
    isRefreshToken: true
  }
}

function verifyToken (
  token: string,
  authTokenSecret: string
): string | jwt.JwtPayload {
  try {
    return jwt.verify(token, authTokenSecret)
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthTokenExpiredError()
    }

    throw new InvalidAuthTokenError()
  }
}
