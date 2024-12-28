import { ajv } from '../ajv'
import type { DbRefreshToken } from '../auth/refresh-token'

import {
  invalidPasswordChangeError,
  invalidSignInMethodError
} from '../errors'
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

const isPasswordSignInMethodValid = ajv.compile<PasswordSignInMethod>({
  type: 'object',
  required: ['username', 'password'],
  additionalProperties: false,
  properties: {
    username: {
      type: 'string',
      minLength: 1
    },
    password: {
      type: 'string',
      minLength: 1
    }
  }
})

export interface SignInUsingPasswordIf {
  lockUserByUsername: (userName: string) => Promise<User | undefined>
  findPasswordSignInMethod: (
    userId: string
  ) => Promise<UserPasswordHash | undefined>
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
}

export function validatePasswordSignInMethod (
  request: unknown
): PasswordSignInMethod {
  if (!isPasswordSignInMethodValid(request)) {
    throw invalidSignInMethodError
  }
  return {
    username: request.username,
    password: request.password
  }
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

const isPasswordChangeValid = ajv.compile<PasswordChange>({
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: {
      type: 'string',
      minLength: 1
    },
    newPassword: {
      type: 'string',
      minLength: 1
    }
  }
})

export function validatePasswordChange (request: unknown): PasswordChange {
  if (!isPasswordChangeValid(request)) {
    throw invalidPasswordChangeError
  }
  return {
    oldPassword: request.oldPassword,
    newPassword: request.newPassword
  }
}

export interface UserPasswordHash {
  userId: string
  passwordHash: string
}
