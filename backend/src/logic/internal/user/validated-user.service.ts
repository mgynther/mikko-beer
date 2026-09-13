import * as userService from '../user/user.service.js'
import * as signInMethodUserService from '../user/sign-in-method-user.service.js'

import type {
  CreateUserIf,
  User,
  ValidateCreateUser,
  ValidateUserId,
} from '../../user/user.js'
import {
  invalidSignInMethodError,
  invalidUserError,
  invalidUserIdError,
} from '../../errors.js'

import type { log } from '../../log.js'
import type { AuthTokenConfig } from '../../auth/auth-token.js'
import type { SignedInUser } from '../../user/signed-in-user.js'

export async function createUser(
  createUserIf: CreateUserIf,
  validate: ValidateCreateUser,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  const validationResult = validate(body)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-user':
        throw invalidUserError
      case 'invalid-sign-in-method':
        throw invalidSignInMethodError
    }
  }
  return await signInMethodUserService.createUser(
    createUserIf,
    validationResult.result,
    authTokenConfig,
    log,
  )
}

export async function findUserById(
  findUserById: (userId: string) => Promise<User | undefined>,
  validateUserId: ValidateUserId,
  id: string | undefined,
  log: log,
): Promise<User> {
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  return await userService.findUserById(findUserById, idResult.result, log)
}

export async function listUsers(
  listUsers: () => Promise<User[]>,
  log: log,
): Promise<User[]> {
  return await userService.listUsers(listUsers, log)
}

export async function deleteUserById(
  deleteUserById: (id: string) => Promise<void>,
  validateUserId: ValidateUserId,
  id: string | undefined,
  log: log,
): Promise<void> {
  const idResult = validateUserId(id)
  if (idResult.errorCode === 'invalid-user-id') {
    throw invalidUserIdError
  }
  await userService.deleteUserById(deleteUserById, idResult.result, log)
}
