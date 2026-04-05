import * as userService from '../user/user.service.js'
import * as signInMethodService from '../user/sign-in-method.service.js'

import type { CreateUserIf, CreateUserRequest } from "../../user/user"

import type { log } from '../../log.js'
import type { AuthTokenConfig } from '../../auth/auth-token.js'
import type { SignedInUser } from './signed-in-user.js'

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
