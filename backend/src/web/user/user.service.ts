import * as userRepository from '../../data/user/user.repository'
import * as authTokenService from '../../core/authentication/auth-token.service'
import { config } from '../config'
import { type Database, type Transaction } from '../../data/database'
import { type SignedInUser } from '../../core/user/signed-in-user'
import { Role, type User } from '../../core/user/user'
import {
  type DbRefreshToken,
  type RefreshToken
} from '../../core/authentication/refresh-token'

export async function createAnonymousUser (
  trx: Transaction,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  updateRefreshToken: (refreshTokenId: string) => Promise<void>,
  role: Role,
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(trx, { role })

  const refreshToken = await authTokenService.createRefreshToken(
    insertRefreshToken,
    user.id,
    config.authTokenSecret
  )
  return createSignedInUser(updateRefreshToken, user, refreshToken)
}

export async function createInitialAdmin (
  trx: Transaction,
  updateRefreshToken: (refreshTokenId: string) => Promise<void>,
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(
    trx,
    { role: Role.admin }
  )

  const refreshToken = await authTokenService.createInitialAdminRefreshToken(
    user.id,
    config.authTokenSecret
  )
  return createSignedInUser(updateRefreshToken, user, refreshToken)
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

async function createSignedInUser(
  updateRefreshToken: (refreshTokenId: string) => Promise<void>,
  user: User,
  refreshToken: RefreshToken
): Promise<SignedInUser> {
  const authToken = await authTokenService.createAuthToken(
    updateRefreshToken,
    user.role,
    refreshToken,
    config.authTokenSecret,
    config.authTokenExpiryDuration
  )
  return {
    refreshToken,
    authToken,
    user
  }
}
