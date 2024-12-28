import { v4 as uuidv4 } from 'uuid'

import * as userService from './user/user.service'
import * as signInMethodService from './user/sign-in-method.service'

import type { log } from './log'
import { Role } from './user/user'

import type { CreateAnonymousUserRequest, User } from "./user/user"
import type { AuthTokenConfig } from './auth/auth-token'
import type {
  AddPasswordUserIf,
  PasswordSignInMethod
} from './user/sign-in-method'
import type { SignedInUser } from './user/signed-in-user'
import type { DbRefreshToken } from './auth/refresh-token'

export async function createInitialUser (
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  /* eslint-disable-next-line @typescript-eslint/require-await --
   * async required by interface.
   */
  const insertRefreshToken = async (userId: string): Promise<DbRefreshToken> => 
    // Here we don't need a refresh token in db. One will be created
    // when admin user logs in.
     ({
      id: uuidv4(),
      userId
    })

  const user = await userService.createAnonymousUser(
    createAnonymousUser,
    insertRefreshToken,
    Role.admin,
    authTokenConfig,
    log
  )
  return user
}

export async function addPasswordForInitialUser (
  addPasswordUserIf: AddPasswordUserIf,
  userId: string,
  passwordSignInMethod: PasswordSignInMethod,
  log: log
): Promise<void> {
  await signInMethodService.addPasswordSignInMethod(
    addPasswordUserIf,
    userId,
    passwordSignInMethod,
    log
  )
}
