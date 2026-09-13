import * as authTokenService from './auth-token.service.js'

import { validateRefreshToken } from './refresh-token.js'
import type { ValidateUserId } from '../../user/user.js'
import { invalidUserIdError } from '../../errors.js'

export async function deleteRefreshToken(
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  validateUserId: ValidateUserId,
  id: string | undefined,
  body: unknown,
  authTokenSecret: string,
): Promise<void> {
  const refreshToken = validateRefreshToken(body)
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    idResult.result,
    refreshToken,
    authTokenSecret,
  )
}
