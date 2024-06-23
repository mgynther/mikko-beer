import * as authTokenService from './auth-token.service'
import { Role } from '../user/user'

import { ControllerError } from '../errors'
import { type DbRefreshToken } from './refresh-token'
import { AuthTokenExpiredError, type AuthTokenPayload } from './auth-token'

export const expiredAuthTokenError = new ControllerError(
  401,
  'ExpiredAuthToken',
  'the auth token has expired'
)

export const invalidAuthorizationHeaderError = new ControllerError(
  400,
  'InvalidAuthorizationHeader',
  'missing or invalid Authorization header'
)

export const invalidAuthTokenError = new ControllerError(
  401,
  'InvalidAuthToken',
  'invalid auth token'
)

export const noUserIdParameterError = new ControllerError(
  400,
  'NoUserIdParameter',
  'no user id parameter found in the route'
)

export const noRightsError = new ControllerError(
  403,
  'Forbidden',
  'no rights'
)

export const userMismatchError = new ControllerError(
  403,
  'UserMismatch',
  "wrong user's auth token"
)

export const userOrRefreshTokenNotFoundError = new ControllerError(
  404,
  'UserOrRefreshTokenNotFound',
  'either the user or the refresh token has been deleted'
)

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
  const role = payload.role
  if (role !== Role.admin && role !== Role.viewer) {
    throw noRightsError
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
  let authTokenPayload: AuthTokenPayload | undefined

  try {
    authTokenPayload = authTokenService.verifyAuthToken(
      { authToken },
      authTokenSecret
    )
  } catch (error) {
    if (error instanceof AuthTokenExpiredError) {
      throw expiredAuthTokenError
    }

    throw invalidAuthTokenError
  }
  return authTokenPayload
}
