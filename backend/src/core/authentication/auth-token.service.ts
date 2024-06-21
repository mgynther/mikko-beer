import * as jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

import { type AuthToken } from '../../core/authentication/auth-token'
import {
  type DbRefreshToken,
  type RefreshToken
} from '../../core/authentication/refresh-token'
import { type Role } from '../../core/user/user'

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

export async function createRefreshToken (
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  userId: string,
  authTokenSecret: string
): Promise<RefreshToken> {
  const token = await insertRefreshToken(userId)

  return signRefreshToken({
    userId,
    refreshTokenId: token.id,
    isRefreshToken: true
  }, authTokenSecret)
}

export async function createInitialAdminRefreshToken (
  userId: string,
  authTokenSecret: string
): Promise<RefreshToken> {
  const refreshTokenId = uuidv4()

  return signRefreshToken({
    userId,
    refreshTokenId,
    isRefreshToken: true
  }, authTokenSecret)
}

function signRefreshToken (
  tokenPayload: RefreshTokenPayload,
  authTokenSecret: string
): RefreshToken {
  // Refresh tokens never expire.
  return { refreshToken: jwt.sign(tokenPayload, authTokenSecret) }
}

export async function createAuthToken (
  updateRefreshToken: (refreshTokenId: string) => Promise<void>,
  role: Role,
  refreshToken: RefreshToken,
  authTokenSecret: string,
  authTokenExpiryDuration: string
): Promise<AuthToken> {
  const { userId, refreshTokenId } = verifyRefreshToken(
    refreshToken,
    authTokenSecret
  )

  await updateRefreshToken(refreshTokenId)

  return signAuthToken(
    { userId, role, refreshTokenId },
    authTokenSecret,
    authTokenExpiryDuration
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
  authTokenSecret: string,
  authTokenExpiryDuration: string
): AuthToken {
  return {
    authToken: jwt.sign(tokenPayload, authTokenSecret, {
      expiresIn: authTokenExpiryDuration
    })
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
