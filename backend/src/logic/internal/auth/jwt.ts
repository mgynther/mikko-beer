// This file converts between logic types and the plain claims of the jwt
// layer. The jwt implementation itself is injected as JwtIf so that the logic
// layer never depends on a jwt library.
import type {
  AuthToken,
  AuthTokenConfig,
  AuthTokenPayload,
  JwtIf,
} from '../../auth/auth-token.js'
import {
  AuthTokenExpiredError,
  InvalidAuthTokenError,
} from '../../auth/auth-token.js'

import type { RefreshToken } from '../../auth/refresh-token.js'
import {
  parseAuthTokenPayload,
  parseRefreshTokenPayload,
} from './jwt-parser.js'

export interface RefreshTokenPayload {
  userId: string
  refreshTokenId: string
  isRefreshToken: true
}

export function signAuthToken(
  jwtIf: JwtIf,
  tokenPayload: AuthTokenPayload,
  authTokenConfig: AuthTokenConfig,
): AuthToken {
  return {
    authToken: jwtIf.sign(
      { ...tokenPayload },
      authTokenConfig.secret,
      authTokenConfig.expiryDurationMin,
    ),
  }
}

export function signRefreshToken(
  jwtIf: JwtIf,
  tokenPayload: RefreshTokenPayload,
  authTokenSecret: string,
): RefreshToken {
  // Refresh tokens never expire.
  return {
    refreshToken: jwtIf.sign({ ...tokenPayload }, authTokenSecret, undefined),
  }
}

export function verifyAuthToken(
  jwtIf: JwtIf,
  token: AuthToken,
  authTokenSecret: string,
): AuthTokenPayload {
  const payload = verifyToken(jwtIf, token.authToken, authTokenSecret)
  return parseAuthTokenPayload(payload)
}

export function verifyRefreshToken(
  jwtIf: JwtIf,
  token: RefreshToken,
  authTokenSecret: string,
): RefreshTokenPayload {
  const payload = verifyToken(jwtIf, token.refreshToken, authTokenSecret)
  return parseRefreshTokenPayload(payload)
}

function verifyToken(
  jwtIf: JwtIf,
  token: string,
  authTokenSecret: string,
): unknown {
  const verificationResult = jwtIf.verify(token, authTokenSecret)
  if (verificationResult.errorCode !== undefined) {
    switch (verificationResult.errorCode) {
      case 'expired-jwt':
        throw new AuthTokenExpiredError()
      case 'invalid-jwt':
        throw new InvalidAuthTokenError()
    }
  }
  return verificationResult.result
}
