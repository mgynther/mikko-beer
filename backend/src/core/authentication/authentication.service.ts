import * as authTokenService from './auth-token.service'
import { Role } from '../user/user'

import type { DbRefreshToken } from './refresh-token'
import { AuthTokenExpiredError, type AuthTokenPayload } from './auth-token'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from '../errors'

export async function authenticateUser (
  userId: string | undefined,
  authorizationHeader: string | undefined,
  authTokenSecret: string,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>
): Promise<void> {
  if (userId === undefined) {
    throw noUserIdParameterError
  }

  const authorization = validAuthorizationOrThrow(authorizationHeader)
  const authTokenPayload = validAuthTokenPayload(authorization, authTokenSecret)

  if (authTokenPayload.role === Role.admin) {
    return
  }

  if (userId !== authTokenPayload.userId) {
    throw userMismatchError
  }

  const refreshToken = await findRefreshToken(
    authTokenPayload.userId,
    authTokenPayload.refreshTokenId
  )

  if (refreshToken === undefined) {
    throw userOrRefreshTokenNotFoundError
  }
}

export function authenticateAdmin (
  authorizationHeader: string | undefined,
  authTokenSecret: string
): void {
  const authorization = validAuthorizationOrThrow(authorizationHeader)
  const payload = validAuthTokenPayload(authorization, authTokenSecret)
  if (payload.role !== Role.admin) {
    throw noRightsError
  }
}

export function authenticateViewer (
  authorizationHeader: string | undefined,
  authTokenSecret: string
): void {
  const authorization = validAuthorizationOrThrow(authorizationHeader)
  const payload = validAuthTokenPayload(authorization, authTokenSecret)
  const {role} = payload
  switch (role) {
    case Role.admin:
    case Role.viewer:
  }
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
