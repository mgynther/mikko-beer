import * as authTokenService from '../authentication/auth-token.service'
import { type SignedInUser } from './signed-in-user'
import {
  type CreateAnonymousUserRequest,
  type Role,
  type User
} from './user'

import { invalidCredentialsError, userNotFoundError } from '../errors'
import { INFO, type log } from '../log'
import { type DbRefreshToken } from '../authentication/refresh-token'
import { type AuthTokenConfig } from '../authentication/auth-token'

export async function createAnonymousUser (
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  role: Role,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  log(INFO, 'create user with role', role)
  const user = await createAnonymousUser({ role })

  const { refresh, auth } = await authTokenService.createTokens(
    insertRefreshToken,
    user,
    authTokenConfig
  )
  log(INFO, 'created user', user.id)
  return {
    refreshToken: refresh,
    authToken: auth,
    user
  }
}

export async function findUserById (
  findUserById: (userId: string) => Promise<User | undefined>,
  userId: string,
  log: log
): Promise<User> {
  log(INFO, 'find user', userId)
  const user = await findUserById(userId)
  if (user === undefined) {
    throw userNotFoundError(userId)
  }
  return user
}

export async function listUsers (
  listUsers: () => Promise<User[]>,
  log: log
): Promise<User[]> {
  log(INFO, 'list users')
  return await listUsers()
}

export async function lockUserById (
  lockUserById: (id: string) => Promise<User | undefined>,
  id: string
): Promise<User> {
  const user = await lockUserById(id)
  if (user === undefined) {
    throw invalidCredentialsError
  }
  return user
}

export async function lockUserByUsername (
  lockUserByUsername: (username: string) => Promise<User | undefined>,
  username: string
): Promise<User | undefined> {
  return await lockUserByUsername(username)
}

export async function setUserUsername (
  setUserUsername: (userId: string, username: string) => Promise<void>,
  userId: string,
  username: string,
  log: log
): Promise<void> {
  log(INFO, 'set user username', userId, username)
  await setUserUsername(userId, username)
}

export async function deleteUserById (
  deleteUserById: (id: string) => Promise<void>,
  id: string,
  log: log
): Promise<void> {
  log(INFO, 'delete user', id)
  await deleteUserById(id)
}
