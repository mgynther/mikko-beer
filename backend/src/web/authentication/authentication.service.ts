import * as authTokenService from '../../core/authentication/auth-token.service'
import { Role } from '../../core/user/user'

import {
  AuthTokenExpiredError,
  type AuthTokenPayload
} from '../../core/authentication/auth-token.service'
import { ControllerError } from '../../core/errors'
import { type DbRefreshToken } from '../../core/authentication/refresh-token'

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
    throw new ControllerError(
      400,
      'NoUserIdParameter',
      'no user id parameter found in the route'
    )
  }

  const authorization = validAuthorizationOrThrow(authorizationHeader)

  if (authorization === undefined || !authorization.startsWith('Bearer ')) {
    throw new ControllerError(
      400,
      'InvalidAuthorizationHeader',
      'missing or invalid Authorization header'
    )
  }

  const authTokenPayload = validAuthTokenPayload(authorization, authTokenSecret)

  if (authTokenPayload.role === Role.admin) {
    return
  }

  if (userId !== authTokenPayload.userId) {
    throw new ControllerError(403, 'UserMismatch', "wrong user's auth token")
  }

  const refreshToken = await findRefreshToken(
    authTokenPayload.userId,
    authTokenPayload.refreshTokenId
  )

  if (refreshToken === undefined) {
    throw new ControllerError(
      404,
      'UserOrRefreshTokenNotFound',
      'either the user or the refresh token has been deleted'
    )
  }
}

export function authenticateAdmin (
  authorizationHeader: string | undefined,
  authTokenSecret: string
): void {
  const authorization = validAuthorizationOrThrow(authorizationHeader)
  const payload = validAuthTokenPayload(authorization, authTokenSecret)
  if (payload.role !== Role.admin) {
    throw new ControllerError(
      403,
      'Forbidden',
      'no rights'
    )
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
    throw new ControllerError(
      403,
      'Forbidden',
      'no rights'
    )
  }
}

function validAuthorizationOrThrow (authorization: string | undefined): string {
  if (authorization === undefined || !authorization.startsWith('Bearer ')) {
    throw new ControllerError(
      400,
      'InvalidAuthorizationHeader',
      'missing or invalid Authorization header'
    )
  }
  return authorization
}

function validAuthTokenPayload (authorization: string, authTokenSecret: string): AuthTokenPayload {
  const authToken = authorization.substring('Bearer '.length)
  let authTokenPayload: AuthTokenPayload | undefined

  try {
    authTokenPayload = authTokenService.verifyAuthToken(
      { authToken },
      authTokenSecret
    )
  } catch (error) {
    if (error instanceof AuthTokenExpiredError) {
      throw new ControllerError(
        401,
        'ExpiredAuthToken',
        'the auth token has expired'
      )
    }

    throw new ControllerError(401, 'InvalidAuthToken', 'invalid auth token')
  }
  return authTokenPayload
}
