import * as authTokenService from '../internal/auth/auth-token.service.js'

import type { AuthTokenPayload, JwtIf } from './auth-token.js'
import { AuthTokenExpiredError } from './auth-token.js'
import type {
  RefreshTokenPayload,
  ValidateRefreshToken,
} from './refresh-token.js'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
  invalidRefreshTokenError,
} from '../errors.js'

export function parseAuthTokenPayload(
  jwtIf: JwtIf,
  authorizationHeader: string | undefined,
  authTokenSecret: string,
): AuthTokenPayload {
  const authorization = validAuthorizationOrThrow(authorizationHeader)
  return validAuthTokenPayload(jwtIf, authorization, authTokenSecret)
}

export function parseRefreshTokenPayload(
  jwtIf: JwtIf,
  validateRefreshToken: ValidateRefreshToken,
  body: unknown,
  authTokenSecret: string,
): RefreshTokenPayload {
  const validationResult = validateRefreshToken(body)
  if (validationResult.errorCode === 'invalid-refresh-token') {
    throw invalidRefreshTokenError
  }
  return authTokenService.parseRefreshToken(
    jwtIf,
    validationResult.result,
    authTokenSecret,
  )
}

function validAuthorizationOrThrow(authorization: string | undefined): string {
  const error = invalidAuthorizationHeaderError
  if (authorization === undefined) {
    throw error
  }
  if (!authorization.startsWith('Bearer ')) {
    throw error
  }
  return authorization
}

function validAuthTokenPayload(
  jwtIf: JwtIf,
  authorization: string,
  authTokenSecret: string,
): AuthTokenPayload {
  const authToken = authorization.substring('Bearer '.length)
  try {
    const authTokenPayload: AuthTokenPayload = authTokenService.verifyAuthToken(
      jwtIf,
      { authToken },
      authTokenSecret,
    )
    return authTokenPayload
  } catch (error) {
    if (error instanceof AuthTokenExpiredError) {
      throw expiredAuthTokenError
    }

    throw invalidAuthTokenError
  }
}
