import * as authTokenService from './auth-token.service'

import { validateRefreshToken } from "../../auth/refresh-token";
import { validateUserId } from '../../user/user';

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
