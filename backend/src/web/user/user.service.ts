import * as userRepository from '../../data/user/user.repository'
import * as authTokenService from '../authentication/auth-token.service'
import { type Database, type Transaction } from '../../data/database'
import { type SignedInUser } from '../../core/user/signed-in-user'
import { type Role, type User } from '../../core/user/user'

export async function createAnonymousUser (
  trx: Transaction,
  role: Role,
  createRefreshToken: boolean = true
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(trx, { role })

  const refreshTokenPromise = createRefreshToken
    ? authTokenService.createRefreshToken(trx, user.id)
    : authTokenService.createInitialAdminRefreshToken(user.id)

  const refreshToken = await refreshTokenPromise
  const authToken = await authTokenService.createAuthToken(
    trx, user.role, refreshToken)
  return {
    refreshToken,
    authToken,
    user
  }
}

export async function findUserById (
  db: Database,
  userId: string
): Promise<User | undefined> {
  return await userRepository.findUserById(db, userId)
}

export async function listUsers (
  db: Database
): Promise<User[]> {
  return await userRepository.listUsers(db)
}

export async function lockUserById (
  trx: Transaction,
  id: string
): Promise<User | undefined> {
  return await userRepository.lockUserById(trx, id)
}

export async function lockUserByUsername (
  trx: Transaction,
  username: string
): Promise<User | undefined> {
  return await userRepository.lockUserByUsername(trx, username)
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
