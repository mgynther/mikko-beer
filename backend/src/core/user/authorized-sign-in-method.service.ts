import * as authorizationService from '../auth/authorization.service'
import * as signInMethodService from './sign-in-method.service'

import type { DbRefreshToken } from '../auth/refresh-token'
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
import type { AuthTokenConfig } from '../auth/auth-token'

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
