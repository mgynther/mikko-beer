import * as userRepository from '../../data/user/user.repository'
import * as authTokenService from '../authentication/auth-token.service'
import { type Database, type Transaction } from '../../data/database'
import { type SignedInUser } from '../../core/user/signed-in-user'
import { Role, type User } from '../../core/user/user'
import { type RefreshToken } from '../../core/authentication/refresh-token'

export async function createAnonymousUser (
  trx: Transaction,
  role: Role,
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(trx, { role })

  const refreshToken = await authTokenService.createRefreshToken(trx, user.id)
  return createSignedInUser(trx, user, refreshToken)
}

export async function createInitialAdmin (
  trx: Transaction,
): Promise<SignedInUser> {
  const user = await userRepository.createAnonymousUser(
    trx,
    { role: Role.admin }
  )

  const refreshToken = await authTokenService.createInitialAdminRefreshToken(
    user.id
  )
  return createSignedInUser(trx, user, refreshToken)
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
  trx: Transaction,
  user: User,
  refreshToken: RefreshToken
): Promise<SignedInUser> {
  const authToken = await authTokenService.createAuthToken(
    trx, user.role, refreshToken)
  return {
    refreshToken,
    authToken,
    user
  }
}
