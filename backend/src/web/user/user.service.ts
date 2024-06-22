import * as userRepository from '../../data/user/user.repository'
import * as authTokenService from '../../core/authentication/auth-token.service'
import { config } from '../config'
import { type Database, type Transaction } from '../../data/database'
import { type SignedInUser } from '../../core/user/signed-in-user'
import { Role, type User } from '../../core/user/user'
import { type DbRefreshToken, } from '../../core/authentication/refresh-token'

export async function createAnonymousUser (
  trx: Transaction,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  role: Role,
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(trx, { role })

  const { refresh, auth } = await authTokenService.createTokens(
    insertRefreshToken,
    user,
    config.authTokenSecret,
    config.authTokenExpiryDuration,
  )
  return {
    refreshToken: refresh,
    authToken: auth,
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
