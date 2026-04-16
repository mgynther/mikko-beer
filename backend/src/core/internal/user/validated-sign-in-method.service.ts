import * as signInMethodService from '../user/sign-in-method.service.js'

import type { log } from '../../log.js'
import {
  validatePasswordChange,
  validatePasswordSignInMethod,
} from './sign-in-method.validation.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
} from '../../user/sign-in-method.js'
import type { SignedInUser } from './signed-in-user.js'
import { validateUserId } from '../user/validation.js'
import type { AuthTokenConfig } from '../../auth/auth-token.js'

export async function signInUsingPassword(
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  const method = validatePasswordSignInMethod(body)
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    method,
    authTokenConfig,
    log,
  )
}

export async function changePassword(
  changePasswordUserIf: ChangePasswordUserIf,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<void> {
  const change = validatePasswordChange(body)
  await signInMethodService.changePassword(
    changePasswordUserIf,
    validateUserId(id),
    change,
    log,
  )
}
