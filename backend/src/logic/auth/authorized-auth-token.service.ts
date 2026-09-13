import * as authorizationService from '../internal/auth/authorization.service.js'
import * as authTokenService from '../internal/auth/validated-auth-token.service.js'

import type { IdRequest } from '../request'
import type { DbRefreshToken } from './refresh-token'
import type { ValidateUserId } from '../user/user.js'

export async function deleteRefreshToken(
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  validateUserId: ValidateUserId,
  request: IdRequest,
  body: unknown,
  authTokenSecret: string,
): Promise<void> {
  await authorizationService.authorizeUser(
    request.id,
    request.authTokenPayload,
    findRefreshToken,
  )
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    validateUserId,
    request.id,
    body,
    authTokenSecret,
  )
}
