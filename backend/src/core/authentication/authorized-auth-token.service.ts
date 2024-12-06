import * as authService from '../../core/authentication/authentication.service'
import * as authTokenService from './auth-token.service'

import type { IdRequest } from "../request";
import type { DbRefreshToken } from "./refresh-token";
import { validateRefreshToken } from "./refresh-token";

export async function deleteRefreshToken (
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>,
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  request: IdRequest,
  body: unknown,
  authTokenSecret: string
): Promise<void> {
  await authService.authenticateUserPayload(
    request.id, request.authTokenPayload, findRefreshToken)
  const refreshToken = validateRefreshToken(body)
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    request.id,
    refreshToken,
    authTokenSecret
  )
}
