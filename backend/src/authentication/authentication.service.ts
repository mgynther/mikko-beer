import * as refreshTokenRepository from './refresh-token.repository'
import * as authTokenService from './auth-token.service'

import { AuthTokenExpiredError, AuthTokenPayload } from './auth-token.service'
import { Next } from 'koa'
import { Context } from '../context'
import { ControllerError } from '../util/errors'

export async function authenticateUser(
  ctx: Context,
  next: Next
): Promise<void> {
  const { userId } = ctx.params

  if (!userId) {
    throw new ControllerError(
      400,
      'NoUserIdParameter',
      'no user id parameter found in the route'
    )
  }

  const authorization = parseAuthorization(ctx)

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ControllerError(
      400,
      'InvalidAuthorizationHeader',
      'missing or invalid Authorization header'
    )
  }

  const authTokenPayload = validAuthTokenPayload(authorization)

  if (userId !== authTokenPayload.userId) {
    throw new ControllerError(403, 'UserMismatch', "wrong user's auth token")
  }

  const refreshToken = await refreshTokenRepository.findRefreshToken(
    ctx.db,
    authTokenPayload.userId,
    authTokenPayload.refreshTokenId
  )

  if (!refreshToken) {
    throw new ControllerError(
      404,
      'UserOrRefreshTokenNotFound',
      'either the user or the refresh token has been deleted'
    )
  }

  return next()
}

// TODO this is just a placeholder for proper authentication and authorization.
export async function authenticateGeneric(
  ctx: Context,
  next: Next
): Promise<void> {
  const authorization = parseAuthorization(ctx)
  validAuthTokenPayload(authorization)
  return next()
}

function parseAuthorization(ctx: Context) {
  const authorization = ctx.headers['authorization']
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ControllerError(
      400,
      'InvalidAuthorizationHeader',
      'missing or invalid Authorization header'
    )
  }
  return authorization
}

function validAuthTokenPayload(authorization: string) {
  const authToken = authorization.substring('Bearer '.length)
  let authTokenPayload: AuthTokenPayload | undefined

  try {
    authTokenPayload = authTokenService.verifyAuthToken({ authToken })
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
