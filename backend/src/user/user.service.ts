import * as userRepository from './user.repository'
import * as authTokenService from '../authentication/auth-token.service'

import { type Database, type Transaction } from '../database'
import { type SignedInUser } from './signed-in-user'
import { type CreateAnonymousUserRequest, type User } from './user'
import { type UserRow } from './user.table'

export async function createAnonymousUser (
  trx: Transaction,
  request: CreateAnonymousUserRequest
): Promise<SignedInUser> {
  const user = await userRepository.insertUser(trx, {
    first_name: request.firstName,
    last_name: request.lastName
  })

  const refreshToken = await authTokenService.createRefreshToken(
    trx,
    user.user_id
  )

  const authToken = await authTokenService.createAuthToken(trx, refreshToken)

  return {
    refreshToken,
    authToken,
    user: userRowToUser(user)
  }
}

export async function findUserById (
  db: Database,
  userId: string
): Promise<User | undefined> {
  const userRow = await userRepository.findUserById(db, userId)

  if (userRow != null) {
    return userRowToUser(userRow)
  }
}

export async function lockUserById (
  trx: Transaction,
  id: string
): Promise<User | undefined> {
  const userRow = await userRepository.lockUserById(trx, id)

  if (userRow != null) {
    return userRowToUser(userRow)
  }
}

export async function lockUserByUsername (
  trx: Transaction,
  username: string
): Promise<User | undefined> {
  const userRow = await userRepository.lockUserByUsername(trx, username)

  if (userRow != null) {
    return userRowToUser(userRow)
  }
}

export async function setUserUsername (
  trx: Transaction,
  userId: string,
  username: string
): Promise<void> {
  await userRepository.setUserUsername(trx, userId, username)
}

export function userRowToUser (user: UserRow): User {
  return {
    id: user.user_id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username
  }
}
