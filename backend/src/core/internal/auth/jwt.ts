// This file wraps jsonwebtoken usage to core types.
import * as jwt from 'jsonwebtoken'
import type {
  AuthToken,
  AuthTokenConfig, AuthTokenPayload
} from '../../auth/auth-token'
import {
  AuthTokenExpiredError, InvalidAuthTokenError
} from '../../auth/auth-token'

import type { RefreshToken } from '../../auth/refresh-token'
import { parseAuthTokenPayload, parseRefreshTokenPayload } from './jwt-parser'

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
  if (typeof payload === 'string') {
    throw new InvalidAuthTokenError()
  }
  return parseAuthTokenPayload(payload)
}

export function verifyRefreshToken (
  token: RefreshToken,
  authTokenSecret: string
): RefreshTokenPayload {
  const payload = verifyToken(token.refreshToken, authTokenSecret)
  if (typeof payload === 'string') {
    throw new InvalidAuthTokenError()
  }
  return parseRefreshTokenPayload(payload)
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
