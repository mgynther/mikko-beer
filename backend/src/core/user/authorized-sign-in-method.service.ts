import * as authService from '../../core/authentication/authentication.service'
import * as signInMethodService from './sign-in-method.service'

import type { DbRefreshToken } from '../authentication/refresh-token'
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

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  body: unknown
): Promise<SignedInUser> {
  // No authorization as sign in takes place here.
  const method = validatePasswordSignInMethod(body)
  return await signInMethodService.signInUsingPassword(
    signInUsingPasswordIf,
    method
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
  await authService.authenticateUser(
    request.id, request.authTokenPayload, findRefreshToken)
  const change = validatePasswordChange(body)
  await signInMethodService.changePassword(
    changePasswordUserIf,
    validateUserId(request.id),
    change
  );
}
