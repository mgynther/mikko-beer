import type { AuthTokenPayload } from "./auth-token"
import {
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from "../errors"
import { Role } from "../user/user"
import type { DbRefreshToken } from "./refresh-token"

export async function authorizeUser (
  userId: string | undefined,
  authTokenPayload: AuthTokenPayload,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>
): Promise<void> {
  if (userId === undefined) {
    throw noUserIdParameterError
  }

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

export function authorizeAdmin (
  payload: AuthTokenPayload
): void {
  if (payload.role !== Role.admin) {
    throw noRightsError
  }
}

export function authorizeViewer (
  payload: AuthTokenPayload
): void {
  const {role} = payload
  switch (role) {
    case Role.admin:
    case Role.viewer:
  }
}
