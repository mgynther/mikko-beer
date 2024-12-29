import type { DbRefreshToken } from '../auth/refresh-token'

import type { User } from './user'

export interface AddPasswordUserIf {
  lockUserById: LockUserById
  insertPasswordSignInMethod: (userPassword: UserPasswordHash) => Promise<void>
  setUserUsername: (userId: string, username: string) => Promise<void>
}

export type SignInMethod = PasswordSignInMethod

export interface PasswordSignInMethod {
  username: string
  password: string
}

export interface SignInUsingPasswordIf {
  lockUserByUsername: (userName: string) => Promise<User | undefined>
  findPasswordSignInMethod: (
    userId: string
  ) => Promise<UserPasswordHash | undefined>
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
}

type LockUserById = (userId: string) => Promise<User | undefined>

export interface ChangePasswordUserIf {
  lockUserById: LockUserById
  findPasswordSignInMethod: (
    userId: string
  ) => Promise<UserPasswordHash | undefined>
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
