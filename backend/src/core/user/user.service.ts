import * as authTokenService from '../../core/authentication/auth-token.service'
import { type SignedInUser } from '../../core/user/signed-in-user'
import {
  type CreateAnonymousUserRequest,
  type Role,
  type User
} from '../../core/user/user'
import { type DbRefreshToken } from '../../core/authentication/refresh-token'
import { type AuthTokenConfig } from '../authentication/auth-token'

export async function createAnonymousUser (
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  role: Role,
  authTokenConfig: AuthTokenConfig
): Promise<SignedInUser> {
  const user = await createAnonymousUser({ role })

  const { refresh, auth } = await authTokenService.createTokens(
    insertRefreshToken,
    user,
    authTokenConfig
  )
  return {
    refreshToken: refresh,
    authToken: auth,
    user
  }
}

export async function findUserById (
  findUserById: (userId: string) => Promise<User | undefined>,
  userId: string
): Promise<User | undefined> {
  return await findUserById(userId)
}

export async function listUsers (
  listUsers: () => Promise<User[]>
): Promise<User[]> {
  return await listUsers()
}

export async function lockUserById (
  lockUserById: (id: string) => Promise<User | undefined>,
  id: string
): Promise<User | undefined> {
  return await lockUserById(id)
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
  username: string
): Promise<void> {
  await setUserUsername(userId, username)
}

export async function deleteUserById (
  deleteUserById: (id: string) => Promise<void>,
  id: string
): Promise<void> {
  await deleteUserById(id)
}
