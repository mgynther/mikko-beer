import * as jwt from 'jsonwebtoken'

import {
  type AuthTokenConfig,
  type AuthToken
} from '../../core/authentication/auth-token'
import { type Tokens } from '../../core/authentication/tokens'
import {
  type DbRefreshToken,
  type RefreshToken
} from '../../core/authentication/refresh-token'
import { type User, type Role } from '../../core/user/user'

export class AuthTokenError extends Error {}
export class InvalidAuthTokenError extends AuthTokenError {}
export class AuthTokenExpiredError extends AuthTokenError {}
export class RefreshTokenUserIdMismatchError extends Error {}

export interface AuthTokenPayload {
  userId: string
  role: Role
  refreshTokenId: string
}

interface RefreshTokenPayload {
  userId: string
  refreshTokenId: string
  isRefreshToken: true
}

export async function createTokens (
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  user: User,
  authTokenConfig: AuthTokenConfig
): Promise<Tokens> {
  const token = await insertRefreshToken(user.id)

  const refresh = signRefreshToken({
    userId: user.id,
    refreshTokenId: token.id,
    isRefreshToken: true
  }, authTokenConfig.secret)

  const auth = createAuthToken(
    user.role,
    refresh,
    authTokenConfig
  )

  return {
    auth,
    refresh
  }
}

export function verifyAuthToken (
  token: AuthToken,
  authTokenSecret: string
): AuthTokenPayload {
  const payload = verifyToken(token.authToken, authTokenSecret)

  if (
    typeof payload === 'string' ||
    typeof payload?.userId !== 'string' ||
    typeof payload?.role !== 'string' ||
    typeof payload?.refreshTokenId !== 'string'
  ) {
    throw new InvalidAuthTokenError()
  }

  return {
    userId: payload.userId,
    role: payload.role as Role,
    refreshTokenId: payload.refreshTokenId
  }
}

export async function deleteRefreshToken (
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  userId: string,
  refreshToken: RefreshToken,
  authTokenSecret: string
): Promise<void> {
  const payload = verifyRefreshToken(refreshToken, authTokenSecret)

  if (payload.userId !== userId) {
    throw new RefreshTokenUserIdMismatchError()
  }

  await deleteRefreshToken(payload.refreshTokenId)
}

function signRefreshToken (
  tokenPayload: RefreshTokenPayload,
  authTokenSecret: string
): RefreshToken {
  // Refresh tokens never expire.
  return { refreshToken: jwt.sign(tokenPayload, authTokenSecret) }
}

function createAuthToken (
  role: Role,
  refreshToken: RefreshToken,
  authTokenConfig: AuthTokenConfig
): AuthToken {
  const { userId, refreshTokenId } = verifyRefreshToken(
    refreshToken,
    authTokenConfig.secret
  )

  return signAuthToken(
    { userId, role, refreshTokenId },
    authTokenConfig
  )
}

function verifyRefreshToken (
  token: RefreshToken,
  authTokenSecret: string
): RefreshTokenPayload {
  const payload = verifyToken(token.refreshToken, authTokenSecret)

  if (
    typeof payload === 'string' ||
    typeof payload?.userId !== 'string' ||
    typeof payload?.refreshTokenId !== 'string' ||
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

function signAuthToken (
  tokenPayload: AuthTokenPayload,
  authTokenConfig: AuthTokenConfig
): AuthToken {
  return {
    authToken: jwt.sign(tokenPayload, authTokenConfig.secret, {
      expiresIn: authTokenConfig.expiryDuration
    })
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
