import { ajv } from '../ajv.js'
import { validatePasswordSignInMethod } from './sign-in-method.validation.js'

import { invalidUserError, invalidUserIdError } from '../../errors.js'
import type {
  CreateAnonymousUserRequest,
  CreateUserRequest,
  CreateUserType,
  Role,
} from '../../user/user.js'

const doValidateCreateAnonymousUserRequest =
  ajv.compile<CreateAnonymousUserRequest>({
    type: 'object',
    required: ['role'],
    additionalProperties: false,
    properties: {
      role: {
        enum: ['admin', 'viewer'],
      },
    },
  })

interface RoleContainer {
  role: Role
}

export function validateCreateAnonymousUserRequest(
  body: unknown,
): CreateAnonymousUserRequest {
  if (!doValidateCreateAnonymousUserRequest(body)) {
    throw invalidUserError
  }
  const roleContainer = body as RoleContainer

  return {
    role: roleContainer.role,
  }
}

export function validateCreateUserRequest(body: unknown): CreateUserRequest {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Using a helper type for validation. Contents being right is not assumed
   * yet.
   */
  const typedBody: CreateUserType = body as CreateUserType
  const anonymousUserRequest = validateCreateAnonymousUserRequest(
    typedBody.user,
  )
  const passwordSignInMethod = validatePasswordSignInMethod(
    typedBody.passwordSignInMethod,
  )
  return {
    role: anonymousUserRequest.role,
    passwordSignInMethod,
  }
}

export function validateUserId(id: string | undefined): string {
  if (id === undefined || id.length === 0) {
    throw invalidUserIdError
  }
  return id
}
