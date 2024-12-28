import * as authTokenService from '../internal/auth/auth-token.service'
import * as authorizationService from '../internal/auth/authorization.service'
import * as signInMethodService from './sign-in-method.service'
import * as userService from '../user/user.service'

import type { DbRefreshToken, RefreshToken } from '../auth/refresh-token'
import {
  validatePasswordChange,
  validatePasswordSignInMethod
} from './sign-in-method'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf
} from './sign-in-method'
import type { IdRequest } from '../request'
import type { SignedInUser } from './signed-in-user'
import { validateUserId } from './user'
import type { User } from './user'
import type { AuthTokenConfig } from '../auth/auth-token'
import type { Tokens } from '../auth/tokens'

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig
): Promise<SignedInUser> {
  // No authorization as sign in takes place here.
  const method = validatePasswordSignInMethod(body)
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    method,
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
  const change = validatePasswordChange(body)
  await signInMethodService.changePassword(
    changePasswordUserIf,
    validateUserId(request.id),
    change
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
  refreshToken: RefreshToken,
  authTokenConfig: AuthTokenConfig
): Promise<Tokens> {
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
