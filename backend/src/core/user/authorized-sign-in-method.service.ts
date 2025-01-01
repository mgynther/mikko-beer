import * as authTokenService from '../internal/auth/auth-token.service'
import * as authorizationService from '../internal/auth/authorization.service'
import * as signInMethodService
from '../internal/user/validated-sign-in-method.service'
import * as userService from '../internal/user/user.service'

import type { DbRefreshToken } from '../auth/refresh-token'
import { validateRefreshToken } from '../internal/auth/refresh-token'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf
} from './sign-in-method'
import type { IdRequest } from '../request'
import type { SignedInUser } from '../internal/user/signed-in-user'
import type { User } from './user'
import type { AuthTokenConfig } from '../auth/auth-token'
import type { Tokens } from '../auth/tokens'

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig
): Promise<SignedInUser> {
  // No authorization as sign in takes place here.
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    body,
    authTokenConfig
  )
}

export async function changePassword (
  changePasswordUserIf: ChangePasswordUserIf,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>,
  request: IdRequest,
  body: unknown
): Promise<void> {
  await authorizationService.authorizeUser(
    request.id, request.authTokenPayload, findRefreshToken)
  await signInMethodService.changePassword(
    changePasswordUserIf,
    request.id,
    body
  );
}

export interface RefreshTokensIf {
  lockUserById: (userId: string) => Promise<User | undefined>
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
}

export async function refreshTokens (
  refreshTokensIf: RefreshTokensIf,
  userId: string,
  body: unknown,
  authTokenConfig: AuthTokenConfig
): Promise<Tokens> {
  const refreshToken = validateRefreshToken(body)
  // No authorization as refresh provides new tokens based on refresh token
  // only.
  const user = await userService.lockUserById(
    refreshTokensIf.lockUserById,
    userId
  )
  await authTokenService.deleteRefreshToken(
    refreshTokensIf.deleteRefreshToken,
    user.id,
    refreshToken,
    authTokenConfig.secret
  )
  const tokens = await authTokenService.createTokens(
    refreshTokensIf.insertRefreshToken,
    user,
    authTokenConfig
  )
  return tokens
}
