import * as userService from '../user/user.service'
import * as signInMethodUserService from '../user/sign-in-method-user.service'

import type { CreateUserIf, User } from "../../user/user"
import { validateCreateUserRequest, validateUserId } from "./validation"

import type { log } from '../../log'
import type { AuthTokenConfig } from '../../auth/auth-token'
import type { SignedInUser } from './signed-in-user'

export async function createUser (
  createUserIf: CreateUserIf,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  const request = validateCreateUserRequest(body)
  return await signInMethodUserService.createUser(
    createUserIf,
    request,
    authTokenConfig,
    log
  )
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
