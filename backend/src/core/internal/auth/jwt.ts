// This file wraps jsonwebtoken usage to core types.
import jwt from 'jsonwebtoken'
const { sign, verify, TokenExpiredError } = jwt
import type { JwtPayload } from 'jsonwebtoken'
import type {
  AuthToken,
  AuthTokenConfig, AuthTokenPayload
} from '../../auth/auth-token.js'
import {
  AuthTokenExpiredError, InvalidAuthTokenError
} from '../../auth/auth-token.js'

import type { RefreshToken } from '../../auth/refresh-token.js'
import { parseAuthTokenPayload, parseRefreshTokenPayload } from './jwt-parser.js'

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
    authToken: sign(tokenPayload, authTokenConfig.secret, {
      expiresIn: `${authTokenConfig.expiryDurationMin}m`
    })
  }
}

export function signRefreshToken (
  tokenPayload: RefreshTokenPayload,
  authTokenSecret: string
): RefreshToken {
  // Refresh tokens never expire.
  return { refreshToken: sign(tokenPayload, authTokenSecret) }
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
): string | JwtPayload {
  try {
    return verify(token, authTokenSecret)
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AuthTokenExpiredError()
    }

    throw new InvalidAuthTokenError()
  }
}
