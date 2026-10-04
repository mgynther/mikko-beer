import * as authTokenService from '../internal/auth/validated-auth-token.service.js'

import type { DeleteRefreshToken, RefreshTokenPayload } from './refresh-token'
import type { User, ValidateUserId } from '../user/user.js'

export interface DeleteRefreshTokenIf {
  lockUserById: (userId: string) => Promise<User | undefined>
  deleteRefreshToken: DeleteRefreshToken
}

export async function deleteRefreshToken(
  deleteRefreshTokenIf: DeleteRefreshTokenIf,
  validateUserId: ValidateUserId,
  userId: string | undefined,
  refreshTokenPayload: RefreshTokenPayload,
): Promise<void> {
  // No authorization as the refresh token is the credential: whoever holds
  // it can already delete it by refreshing with it.
  await authTokenService.deleteRefreshToken(
    deleteRefreshTokenIf,
    validateUserId,
    userId,
    refreshTokenPayload,
  )
}
