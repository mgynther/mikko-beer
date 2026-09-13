import * as authorizationService from '../internal/auth/authorization.service.js'
import * as authTokenService from '../internal/auth/validated-auth-token.service.js'

import type { IdRequest } from '../request'
import type { DbRefreshToken, ValidateRefreshToken } from './refresh-token'
import type { ValidateUserId } from '../user/user.js'
import type { JwtIf } from './auth-token.js'

export async function deleteRefreshToken(
  jwtIf: JwtIf,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  validateRefreshToken: ValidateRefreshToken,
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
    jwtIf,
    deleteRefreshToken,
    validateRefreshToken,
    validateUserId,
    request.id,
    body,
    authTokenSecret,
  )
}
