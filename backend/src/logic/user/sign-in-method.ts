import type { DbRefreshToken } from '../auth/refresh-token.js'
import type { log } from '../log.js'

import type { User } from './user.js'

type EncryptSecret = (logger: log, secret: string) => Promise<string>

export interface AddPasswordUserIf {
  lockUserById: LockUserById
  insertPasswordSignInMethod: (userPassword: UserPasswordHash) => Promise<void>
  encryptSecret: EncryptSecret
  setUserUsername: (userId: string, username: string) => Promise<void>
}

type VerifySecret = (
  logger: log,
  secret: string,
  hash: string,
) => Promise<boolean>

type NeedsRehash = (hash: string) => boolean

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
  needsRehash: NeedsRehash
  encryptSecret: EncryptSecret
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
  updatePassword: (userPasswordHash: UserPasswordHash) => Promise<void>
}

type LockUserById = (userId: string) => Promise<User | undefined>

export interface ChangePasswordUserIf {
  lockUserById: LockUserById
  findPasswordSignInMethod: (
    userId: string,
  ) => Promise<UserPasswordHash | undefined>
  verifySecret: VerifySecret
  encryptSecret: EncryptSecret
  updatePassword: (userPasswordHash: UserPasswordHash) => Promise<void>
}

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

export interface UserPasswordHash {
  userId: string
  passwordHash: string
}

export type PasswordSignInMethodValidationResult =
  | {
      errorCode: 'invalid-sign-in-method'
      result: undefined
    }
  | {
      errorCode: undefined
      result: PasswordSignInMethod
    }

export type ValidatePasswordSignInMethod = (
  request: unknown,
) => PasswordSignInMethodValidationResult

export type PasswordChangeValidationResult =
  | {
      errorCode: 'invalid-password-change'
      result: undefined
    }
  | {
      errorCode: undefined
      result: PasswordChange
    }

export type ValidatePasswordChange = (
  request: unknown,
) => PasswordChangeValidationResult
