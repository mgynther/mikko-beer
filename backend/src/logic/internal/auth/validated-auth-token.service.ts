import * as authTokenService from './auth-token.service.js'

import type { ValidateRefreshToken } from '../../auth/refresh-token.js'
import type { JwtIf } from '../../auth/auth-token.js'
import type { ValidateUserId } from '../../user/user.js'
import { invalidRefreshTokenError, invalidUserIdError } from '../../errors.js'

export async function deleteRefreshToken(
  jwtIf: JwtIf,
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  validateRefreshToken: ValidateRefreshToken,
  validateUserId: ValidateUserId,
  id: string | undefined,
  body: unknown,
  authTokenSecret: string,
): Promise<void> {
  const validationResult = validateRefreshToken(body)
  if (validationResult.errorCode === 'invalid-refresh-token') {
    throw invalidRefreshTokenError
  }
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  await authTokenService.deleteRefreshToken(
    jwtIf,
    deleteRefreshToken,
    idResult.result,
    validationResult.result,
    authTokenSecret,
  )
}
