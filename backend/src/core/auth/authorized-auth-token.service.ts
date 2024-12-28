import * as authorizationService from '../internal/auth/authorization.service'
import * as authTokenService
from '../internal/auth/validated-auth-token.service'

import type { IdRequest } from "../request";
import type { DbRefreshToken } from "./refresh-token";

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
  await authorizationService.authorizeUser(
    request.id, request.authTokenPayload, findRefreshToken)
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    request.id,
    body,
    authTokenSecret
  )
}
