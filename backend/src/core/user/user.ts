import type { AddPasswordUserIf, PasswordSignInMethod } from './sign-in-method'

import type { DbRefreshToken } from '../auth/refresh-token'

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

export interface CreateUserType {
  user?: unknown,
  passwordSignInMethod?: unknown
}
