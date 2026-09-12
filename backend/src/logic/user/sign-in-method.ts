import type { DbRefreshToken } from '../auth/refresh-token.js'
import type { log } from '../log.js'

import type { User } from './user.js'

type EncryptSecret = (logger: log, secret: string) => Promise<string>

export interface AddPasswordUserIf {
  lockUserById: LockUserById
  insertPasswordSignInMethod: (
    userPassword: NewUserPasswordHash,
  ) => Promise<void>
  encryptSecret: EncryptSecret
  setUserUsername: (userId: string, username: string) => Promise<void>
}

type VerifySecret = (
  logger: log,
  secret: string,
  hash: string,
) => Promise<boolean>

export type SignInMethod = PasswordSignInMethod

export interface PasswordSignInMethod {
  username: string
  password: string
}

export interface SignInUsingPasswordIf {
  lockUserByUsername: (userName: string) => Promise<User | undefined>
  findPasswordSignInMethod: (
    userId: string,
  ) => Promise<UserPasswordHash | undefined>
  verifySecret: VerifySecret
  encryptSecret: EncryptSecret
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
  updatePassword: (userPasswordHash: NewUserPasswordHash) => Promise<void>
}

type LockUserById = (userId: string) => Promise<User | undefined>

export interface ChangePasswordUserIf {
  lockUserById: LockUserById
  findPasswordSignInMethod: (
    userId: string,
  ) => Promise<UserPasswordHash | undefined>
  verifySecret: VerifySecret
  encryptSecret: EncryptSecret
  updatePassword: (userPasswordHash: NewUserPasswordHash) => Promise<void>
}

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

export interface UserPasswordHash {
  userId: string
  passwordHash: string
  hashedAt: Date | undefined
}

export interface NewUserPasswordHash {
  userId: string
  passwordHash: string
  hashedAt: Date
}
