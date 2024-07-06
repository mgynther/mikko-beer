import { ajv } from '../ajv'
import {
  type PasswordSignInMethod,
  validatePasswordSignInMethod
} from './sign-in-method'

import { invalidUserError } from '../../core/errors'

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

export function validateCreateAnonymousUserRequest (
  body: unknown
): CreateAnonymousUserRequest {
  if (!doValidateCreateAnonymousUserRequest(body)) {
    throw invalidUserError
  }
  return {
    role: body.role
  }
}

export interface CreateUserRequest {
  role: Role
  passwordSignInMethod: PasswordSignInMethod
}

export function validateCreateUserRequest (body: unknown): CreateUserRequest {
  const anyBody: any = body
  const anonymousUserRequest = validateCreateAnonymousUserRequest(
    anyBody.user
  )
  const passwordSignInMethod = validatePasswordSignInMethod(
    anyBody.passwordSignInMethod
  )
  return {
    role: anonymousUserRequest.role,
    passwordSignInMethod
  }
}
