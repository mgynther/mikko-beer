import * as userService from '../user/user.service'

import type { CreateAnonymousUserRequest, User } from "./user"
import { validateCreateUserRequest, validateUserId } from "./user"

import type { log } from '../log'
import type {
  AuthTokenConfig
} from '../auth/auth-token'
import type { DbRefreshToken } from '../auth/refresh-token'
import type { PasswordSignInMethod } from './sign-in-method'
import type { SignedInUser } from './signed-in-user'

export interface CreateUserIf {
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  addPasswordSignInMethod: (
    userId: string,
    passwordSignInMethod: PasswordSignInMethod
  ) => Promise<string>,
}

export async function createUser (
  createUserIf: CreateUserIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  const request = validateCreateUserRequest(body)
  const user = await userService.createAnonymousUser(
    createUserIf.createAnonymousUser,
    createUserIf.insertRefreshToken,
    request.role,
    authTokenConfig,
    log
  )
  const username = await createUserIf.addPasswordSignInMethod(
    user.user.id,
    request.passwordSignInMethod,
  )
  return {
    ...user,
    user: { ...user.user, username }
  }
}

export async function findUserById (
  findUserById: (userId: string) => Promise<User | undefined>,
  id: string | undefined,
  log: log
): Promise<User> {
  return await userService.findUserById(
    findUserById,
    validateUserId(id),
    log
  )
}

export async function listUsers (
  listUsers: () => Promise<User[]>,
  log: log
): Promise<User[]> {
  return await userService.listUsers(listUsers, log)
}

export async function deleteUserById (
  deleteUserById: (id: string) => Promise<void>,
  id: string | undefined,
  log: log
): Promise<void> {
  await userService.deleteUserById(
    deleteUserById,
    validateUserId(id),
    log
  )
}
