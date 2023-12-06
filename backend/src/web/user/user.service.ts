import * as userRepository from '../../data/user/user.repository'
import * as authTokenService from '../authentication/auth-token.service'
import { type Database, type Transaction } from '../../data/database'
import { type SignedInUser } from '../../core/user/signed-in-user'
import { type Role, type User } from '../../core/user/user'
import { type UserRow } from '../../data/user/user.table'

export async function createAnonymousUser (
  trx: Transaction,
  role: Role,
  createRefreshToken: boolean = true
): Promise<SignedInUser> {
  const user = await userRepository.insertUser(trx, { role })

  const refreshTokenPromise = createRefreshToken
    ? authTokenService.createRefreshToken(trx, user.user_id)
    : authTokenService.createInitialAdminRefreshToken(user.user_id)

  const refreshToken = await refreshTokenPromise
  const authToken = await authTokenService.createAuthToken(
    trx, user.role, refreshToken)
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

export async function listUsers (
  db: Database
): Promise<User[] | undefined> {
  const userRows = await userRepository.listUsers(db)
  if (userRows === undefined) return []

  return userRows.map(userRow => userRowToUser(userRow))
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

export async function deleteUserById (
  trx: Transaction,
  id: string
): Promise<void> {
  await userRepository.deleteUserById(trx, id)
}

export function userRowToUser (user: UserRow): User {
  return {
    id: user.user_id,
    role: user.role,
    username: user.username
  }
}
