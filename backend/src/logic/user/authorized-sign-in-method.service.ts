import * as authTokenService from '../internal/auth/auth-token.service.js'
import * as authorizationService from '../internal/auth/authorization.service.js'
import * as signInMethodService from '../internal/user/validated-sign-in-method.service.js'
import * as userService from '../internal/user/user.service.js'

import type { DbRefreshToken } from '../auth/refresh-token.js'
import type { ValidateRefreshToken } from '../auth/refresh-token.js'
import { invalidRefreshTokenError } from '../errors.js'
import type { log } from '../log.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
  ValidatePasswordChange,
  ValidatePasswordSignInMethod,
} from './sign-in-method.js'
import type { IdRequest } from '../request.js'
import type { SignedInUser } from './signed-in-user.js'
import type { User, ValidateUserId } from './user.js'
import type { AuthTokenConfig, JwtIf } from '../auth/auth-token.js'
import type { Tokens } from '../auth/tokens'

export async function signInUsingPassword(
  jwtIf: JwtIf,
  signInUsingPasswordIf: SignInUsingPasswordIf,
  validate: ValidatePasswordSignInMethod,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  // No authorization as sign in takes place here.
  return await signInMethodService.signInUsingPassword(
    jwtIf,
    signInUsingPasswordIf,
    validate,
    body,
    authTokenConfig,
    log,
  )
}

export async function changePassword(
  changePasswordUserIf: ChangePasswordUserIf,
  validate: ValidatePasswordChange,
  validateUserId: ValidateUserId,
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
    validate,
    validateUserId,
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
  jwtIf: JwtIf,
  refreshTokensIf: RefreshTokensIf,
  validate: ValidateRefreshToken,
  userId: string,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
): Promise<Tokens> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-refresh-token') {
    throw invalidRefreshTokenError
  }
  // No authorization as refresh provides new tokens based on refresh token
  // only.
  const user = await userService.lockUserById(
    refreshTokensIf.lockUserById,
    userId,
  )
  await authTokenService.deleteRefreshToken(
    jwtIf,
    refreshTokensIf.deleteRefreshToken,
    user.id,
    validationResult.result,
    authTokenConfig.secret,
  )
  const tokens = await authTokenService.createTokens(
    jwtIf,
    refreshTokensIf.insertRefreshToken,
    user,
    authTokenConfig,
  )
  return tokens
}
