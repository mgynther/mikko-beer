import * as authTokenService from '../internal/auth/auth-token.service.js'
import * as authorizationService from '../internal/auth/authorization.service.js'
import * as signInMethodService from '../internal/user/validated-sign-in-method.service.js'
import * as userService from '../internal/user/user.service.js'

import type { DbRefreshToken } from '../auth/refresh-token.js'
import { validateRefreshToken } from '../internal/auth/refresh-token.js'
import type { log } from '../log.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
} from './sign-in-method.js'
import type { IdRequest } from '../request.js'
import type { SignedInUser } from '../internal/user/signed-in-user.js'
import type { User } from './user.js'
import type { AuthTokenConfig } from '../auth/auth-token.js'
import type { Tokens } from '../auth/tokens'

export async function signInUsingPassword(
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  // No authorization as sign in takes place here.
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    body,
    authTokenConfig,
    log,
  )
}

export async function changePassword(
  changePasswordUserIf: ChangePasswordUserIf,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string,
  ) => Promise<DbRefreshToken | undefined>,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<void> {
  await authorizationService.authorizeUser(
    request.id,
    request.authTokenPayload,
    findRefreshToken,
  )
  await signInMethodService.changePassword(
    changePasswordUserIf,
    request.id,
    body,
    log,
  )
}

export interface RefreshTokensIf {
  lockUserById: (userId: string) => Promise<User | undefined>
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
}

export async function refreshTokens(
  refreshTokensIf: RefreshTokensIf,
  userId: string,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
): Promise<Tokens> {
  const refreshToken = validateRefreshToken(body)
  // No authorization as refresh provides new tokens based on refresh token
  // only.
  const user = await userService.lockUserById(
    refreshTokensIf.lockUserById,
    userId,
  )
  await authTokenService.deleteRefreshToken(
    refreshTokensIf.deleteRefreshToken,
    user.id,
    refreshToken,
    authTokenConfig.secret,
  )
  const tokens = await authTokenService.createTokens(
    refreshTokensIf.insertRefreshToken,
    user,
    authTokenConfig,
  )
  return tokens
}
