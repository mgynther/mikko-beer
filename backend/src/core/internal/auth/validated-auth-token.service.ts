import * as authTokenService from './auth-token.service'

import { validateRefreshToken } from "./refresh-token";
import { validateUserId } from '../user/validation';

export async function deleteRefreshToken (
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  id: string | undefined,
  body: unknown,
  authTokenSecret: string
): Promise<void> {
  const refreshToken = validateRefreshToken(body)
  await authTokenService.deleteRefreshToken(
    deleteRefreshToken,
    validateUserId(id),
    refreshToken,
    authTokenSecret
  )
}
