import * as userService from '../user/user.service'
import * as signInMethodService from '../user/sign-in-method.service'

import type { CreateUserIf, CreateUserRequest } from "./user"

import type { log } from '../log'
import type { AuthTokenConfig } from '../auth/auth-token'
import type { SignedInUser } from './signed-in-user'

export async function createUser (
  createUserIf: CreateUserIf,
  request: CreateUserRequest,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  const user = await userService.createAnonymousUser(
    createUserIf.createAnonymousUser,
    createUserIf.insertRefreshToken,
    request.role,
    authTokenConfig,
    log
  )
  await signInMethodService.addPasswordSignInMethod(
    createUserIf.addPasswordUserIf,
    user.user.id,
    request.passwordSignInMethod,
    log
  )
  return {
    ...user,
    user: {
      ...user.user,
      username: request.passwordSignInMethod.username
    }
  }
}
