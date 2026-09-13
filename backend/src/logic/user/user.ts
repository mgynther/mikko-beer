import type {
  AddPasswordUserIf,
  PasswordSignInMethod,
} from './sign-in-method.js'

import type { DbRefreshToken } from '../auth/refresh-token.js'

export interface CreateUserIf {
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>
  addPasswordUserIf: AddPasswordUserIf
}

// A much more detailed usage rights could be added but 2 roles is plenty for
// the time being.
export type Role = 'admin' | 'viewer'

export interface User {
  id: string
  role: Role
  username: string | null
}

export interface NewUser {
  role: Role
  username: string
}

export interface CreateAnonymousUserRequest {
  role: Role
}

export interface CreateUserRequest {
  role: Role
  passwordSignInMethod: PasswordSignInMethod
}

export type CreateUserValidationResult =
  | {
      errorCode: 'invalid-user' | 'invalid-sign-in-method'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateUserRequest
    }

export type ValidateCreateUser = (body: unknown) => CreateUserValidationResult

export type ValidateUserIdResult =
  | {
      errorCode: 'invalid-user-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateUserId = (id: string | undefined) => ValidateUserIdResult
