import * as authorizationService from '../internal/auth/authorization.service.js'
import * as authTokenService from '../internal/auth/validated-auth-token.service.js'

import type { IdRequest } from '../request'
import type {
  DbRefreshToken,
  DeleteRefreshToken,
  RefreshTokenPayload,
} from './refresh-token'
import type { User, ValidateUserId } from '../user/user.js'

export interface DeleteRefreshTokenIf {
  lockUserById: (userId: string) => Promise<User | undefined>
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>
  deleteRefreshToken: DeleteRefreshToken
}

export async function deleteRefreshToken(
  deleteRefreshTokenIf: DeleteRefreshTokenIf,
  validateUserId: ValidateUserId,
  request: IdRequest,
  refreshTokenPayload: RefreshTokenPayload,
): Promise<void> {
  await authorizationService.authorizeUserForUpdate(
    request.id,
    request.authTokenPayload,
    deleteRefreshTokenIf.lockUserById,
    deleteRefreshTokenIf.findRefreshToken,
  )
  await authTokenService.deleteRefreshToken(
    deleteRefreshTokenIf.deleteRefreshToken,
    validateUserId,
    request.id,
    refreshTokenPayload,
  )
}
