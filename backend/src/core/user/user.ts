import { ajv } from '../ajv'
import type { PasswordSignInMethod, } from './sign-in-method'
import { validatePasswordSignInMethod } from './sign-in-method'

import { invalidUserError, invalidUserIdError } from '../errors'

// A much more detailed usage rights could be added but 2 roles is plenty for
// the time being.
export enum Role {
  admin = 'admin',
  viewer = 'viewer'
}

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

const doValidateCreateAnonymousUserRequest =
  ajv.compile<CreateAnonymousUserRequest>({
    type: 'object',
    required: ['role'],
    additionalProperties: false,
    properties: {
      role: {
        enum: ['admin', 'viewer']
      }
    }
  })

interface RoleContainer {
  role: Role
}

export function validateCreateAnonymousUserRequest (
  body: unknown
): CreateAnonymousUserRequest {
  if (!doValidateCreateAnonymousUserRequest(body)) {
    throw invalidUserError
  }
  const roleContainer = body as RoleContainer

  return {
    role: roleContainer.role
  }
}

export interface CreateUserRequest {
  role: Role
  passwordSignInMethod: PasswordSignInMethod
}

export interface CreateUserType {
  user?: unknown,
  passwordSignInMethod?: unknown
}

export function validateCreateUserRequest (body: unknown): CreateUserRequest {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Using a helper type for validation. Contents being right is not assumed
   * yet.
   */
  const typedBody: CreateUserType = body as CreateUserType
  const anonymousUserRequest = validateCreateAnonymousUserRequest(
    typedBody.user
  )
  const passwordSignInMethod = validatePasswordSignInMethod(
    typedBody.passwordSignInMethod
  )
  return {
    role: anonymousUserRequest.role,
    passwordSignInMethod
  }
}

export function validateUserId (id: string | undefined): string {
  if (id === undefined || id.length === 0) {
    throw invalidUserIdError
  }
  return id
}
