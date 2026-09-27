import type { AuthTokenPayload } from '../../auth/auth-token.js'
import {
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError,
} from '../../errors.js'
import type { DbRefreshToken } from '../../auth/refresh-token.js'
import type { User } from '../../user/user.js'

export async function authorizeUser(
  userId: string | undefined,
  authTokenPayload: AuthTokenPayload,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
): Promise<void> {
  if (!needsRefreshToken(userId, authTokenPayload)) {
    return
  }
  await findOwnRefreshToken(authTokenPayload, findRefreshToken)
}

// For a transaction that goes on to change the user or its refresh tokens.
// The user is locked before its refresh token because that is the order
// every such transaction locks them in, and two transactions locking them
// in opposite orders deadlock.
export async function authorizeUserForUpdate(
  userId: string | undefined,
  authTokenPayload: AuthTokenPayload,
  lockUserById: (userId: string) => Promise<User | undefined>,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
): Promise<void> {
  if (!needsRefreshToken(userId, authTokenPayload)) {
    return
  }
  const user = await lockUserById(authTokenPayload.userId)
  if (user === undefined) {
    throw userOrRefreshTokenNotFoundError
  }
  await findOwnRefreshToken(authTokenPayload, findRefreshToken)
}

// Throws unless the payload may act on the user, and tells whether that
// still depends on the payload's refresh token existing.
function needsRefreshToken(
  userId: string | undefined,
  authTokenPayload: AuthTokenPayload,
): boolean {
  if (userId === undefined || userId === '') {
    throw noUserIdParameterError
  }

  if (authTokenPayload.role === 'admin') {
    return false
  }

  if (userId !== authTokenPayload.userId) {
    throw userMismatchError
  }
  return true
}

async function findOwnRefreshToken(
  authTokenPayload: AuthTokenPayload,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
): Promise<void> {
  const refreshToken = await findRefreshToken(
    authTokenPayload.userId,
    authTokenPayload.refreshTokenId,
  )

  if (refreshToken === undefined) {
    throw userOrRefreshTokenNotFoundError
  }
}

export function authorizeAdmin(payload: AuthTokenPayload): void {
  if (payload.role !== 'admin') {
    throw noRightsError
  }
}

export function authorizeViewer(payload: AuthTokenPayload): void {
  const { role } = payload
  switch (role) {
    case 'admin':
    case 'viewer':
  }
  // Relying on linting as currently there are no roles that would not pass
  // authorization. On a new role exhaustive switch check will fail, and if
  // a speculative new role would not be allowed to use the system as viewer
  // throwing code would no longer be dead.
}
