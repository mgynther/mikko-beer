import { ajv } from '../ajv'

import {
  invalidPasswordChangeError,
  invalidSignInMethodError
} from '../errors'

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
