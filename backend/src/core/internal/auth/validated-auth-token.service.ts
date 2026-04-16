import * as authTokenService from './auth-token.service.js'

import { validateRefreshToken } from './refresh-token.js'
import { validateUserId } from '../user/validation.js'

export async function deleteRefreshToken(
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  id: string | undefined,
  body: unknown,
  authTokenSecret: string,
): Promise<void> {
  const refreshToken = validateRefreshToken(body)
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    validateUserId(id),
    refreshToken,
    authTokenSecret,
  )
}
