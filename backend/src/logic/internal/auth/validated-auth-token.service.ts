import * as authTokenService from './auth-token.service.js'

import type {
  DeleteRefreshToken,
  RefreshTokenPayload,
} from '../../auth/refresh-token.js'
import type { ValidateUserId } from '../../user/user.js'
import { invalidUserIdError } from '../../errors.js'

export async function deleteRefreshToken(
  deleteRefreshToken: DeleteRefreshToken,
  validateUserId: ValidateUserId,
  id: string | undefined,
  refreshTokenPayload: RefreshTokenPayload,
): Promise<void> {
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  authTokenService.verifyRefreshTokenOwner(idResult.result, refreshTokenPayload)
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    refreshTokenPayload,
  )
}
