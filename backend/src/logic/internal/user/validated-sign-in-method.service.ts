import * as signInMethodService from '../user/sign-in-method.service.js'

import type { log } from '../../log.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
  ValidatePasswordChange,
  ValidatePasswordSignInMethod,
} from '../../user/sign-in-method.js'
import type { SignedInUser } from '../../user/signed-in-user.js'
import type { ValidateUserId } from '../../user/user.js'
import {
  invalidPasswordChangeError,
  invalidSignInMethodError,
  invalidUserIdError,
} from '../../errors.js'
import type { AuthTokenConfig, JwtIf } from '../../auth/auth-token.js'

export async function signInUsingPassword(
  jwtIf: JwtIf,
  signInUsingPasswordIf: SignInUsingPasswordIf,
  validate: ValidatePasswordSignInMethod,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-sign-in-method') {
    throw invalidSignInMethodError
  }
  return await signInMethodService.signInUsingPassword(
    jwtIf,
    signInUsingPasswordIf,
    validationResult.result,
    authTokenConfig,
    log,
  )
}

export async function changePassword(
  changePasswordUserIf: ChangePasswordUserIf,
  validate: ValidatePasswordChange,
  validateUserId: ValidateUserId,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<void> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-password-change') {
    throw invalidPasswordChangeError
  }
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  await signInMethodService.changePassword(
    changePasswordUserIf,
    idResult.result,
    validationResult.result,
    log,
  )
}
