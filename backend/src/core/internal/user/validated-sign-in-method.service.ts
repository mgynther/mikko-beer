import * as signInMethodService from '../user/sign-in-method.service'

import {
  validatePasswordChange,
  validatePasswordSignInMethod
} from './sign-in-method.validation'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf
} from '../../user/sign-in-method'
import type { SignedInUser } from './signed-in-user'
import { validateUserId } from '../user/validation'
import type { AuthTokenConfig } from '../../auth/auth-token'

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig
): Promise<SignedInUser> {
  const method = validatePasswordSignInMethod(body)
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    method,
    authTokenConfig
  )
}

export async function changePassword (
  changePasswordUserIf: ChangePasswordUserIf,
  id: string | undefined,
  body: unknown
): Promise<void> {
  const change = validatePasswordChange(body)
  await signInMethodService.changePassword(
    changePasswordUserIf,
    validateUserId(id),
    change
  );
}
