import type { AuthTokenPayload } from "../../auth/auth-token"
import {
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from "../../errors"
import type { DbRefreshToken } from "../../auth/refresh-token"

export async function authorizeUser (
  userId: string | undefined,
  authTokenPayload: AuthTokenPayload,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>
): Promise<void> {
  if (userId === undefined || userId === '') {
    throw noUserIdParameterError
  }

  if (authTokenPayload.role === 'admin') {
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

export function authorizeAdmin (
  payload: AuthTokenPayload
): void {
  if (payload.role !== 'admin') {
    throw noRightsError
  }
}

export function authorizeViewer (
  payload: AuthTokenPayload
): void {
  const {role} = payload
  switch (role) {
    case 'admin':
    case 'viewer':
  }
  // Relying on linting as currently there are no roles that would not pass
  // authorization. On a new role exhaustive switch check will fail, and if
  // a speculative new role would not be allowed to use the system as viewer
  // throwing code would no longer be dead.
}
