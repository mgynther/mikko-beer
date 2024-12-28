import * as authTokenService from '../internal/auth/auth-token.service'

import type { AuthTokenPayload } from './auth-token'
import { AuthTokenExpiredError } from './auth-token'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
} from '../errors'

export function parseAuthTokenPayload (
  authorizationHeader: string | undefined,
  authTokenSecret: string
): AuthTokenPayload {
  const authorization = validAuthorizationOrThrow(authorizationHeader)
  return validAuthTokenPayload(authorization, authTokenSecret)
}

function validAuthorizationOrThrow (authorization: string | undefined): string {
  const error = invalidAuthorizationHeaderError
  if (authorization === undefined) {
    throw error
  }
  if (!authorization.startsWith('Bearer ')) {
    throw error
  }
  return authorization
}

function validAuthTokenPayload (
  authorization: string,
  authTokenSecret: string
): AuthTokenPayload {
  const authToken = authorization.substring('Bearer '.length)
  try {
    const authTokenPayload: AuthTokenPayload = authTokenService.verifyAuthToken(
      { authToken },
      authTokenSecret
    )
    return authTokenPayload
  } catch (error) {
    if (error instanceof AuthTokenExpiredError) {
      throw expiredAuthTokenError
    }

    throw invalidAuthTokenError
  }
}
