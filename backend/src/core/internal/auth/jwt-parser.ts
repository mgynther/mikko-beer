import { InvalidAuthTokenError } from '../../auth/auth-token'
import type { AuthTokenPayload } from '../../auth/auth-token'
import type { Role } from '../../user/user'
import type { RefreshTokenPayload } from './jwt'

function isRole(role: string): role is Role {
  switch (role) {
    case 'admin':
    case 'viewer':
      return true
  }
  return false
}

export function parseAuthTokenPayload (payload: unknown): AuthTokenPayload {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any,
     @typescript-eslint/no-unsafe-type-assertion --
   * Validated using in the code below.
   */
  const { userId, role, refreshTokenId } = payload as any
  if (
    typeof userId !== 'string' ||
    typeof role !== 'string' ||
    typeof refreshTokenId !== 'string'
  ) {
    throw new InvalidAuthTokenError()
  }

  if (!isRole(role)) {
    throw new InvalidAuthTokenError()
  }

  return {
    userId,
    role,
    refreshTokenId
  }
}

export function parseRefreshTokenPayload (
  payload: unknown
): RefreshTokenPayload {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any,
     @typescript-eslint/no-unsafe-type-assertion --
   * Validated using in the code below.
   */
  const { userId, refreshTokenId, isRefreshToken } = payload as any
  if (
    typeof userId !== 'string' ||
    typeof refreshTokenId !== 'string' ||
    isRefreshToken !== true
  ) {
    throw new InvalidAuthTokenError()
  }

  return {
    userId: userId,
    refreshTokenId: refreshTokenId,
    isRefreshToken: true
  }
}
