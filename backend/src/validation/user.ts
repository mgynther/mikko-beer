import { ajv } from './internal/ajv.js'

// A much more detailed usage rights could be added but 2 roles is plenty for
// the time being.
export type Role = 'admin' | 'viewer'

export interface CreateAnonymousUserRequest {
  role: Role
}

export interface PasswordSignInMethod {
  username: string
  password: string
}

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

export interface CreateUserRequest {
  role: Role
  passwordSignInMethod: PasswordSignInMethod
}

interface CreateUserType {
  user?: unknown
  passwordSignInMethod?: unknown
}

export type CreateAnonymousUserValidationResult =
  | {
      errorCode: 'invalid-user'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateAnonymousUserRequest
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

export type ValidateUserIdResult =
  | {
      errorCode: 'invalid-user-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
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

export type PasswordChangeValidationResult =
  | {
      errorCode: 'invalid-password-change'
      result: undefined
    }
  | {
      errorCode: undefined
      result: PasswordChange
    }

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

export function validateCreateAnonymousUserRequest(
  body: unknown,
): CreateAnonymousUserValidationResult {
  if (!doValidateCreateAnonymousUserRequest(body)) {
    return { errorCode: 'invalid-user', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      role: body.role,
    },
  }
}

export function validateCreateUserRequest(
  body: unknown,
): CreateUserValidationResult {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Using a helper type for validation. Contents being right is not assumed
   * yet.
   */
  const typedBody: CreateUserType = body as CreateUserType
  const userResult = validateCreateAnonymousUserRequest(typedBody.user)
  if (userResult.errorCode === 'invalid-user') {
    return { errorCode: 'invalid-user', result: undefined }
  }
  const signInMethodResult = validatePasswordSignInMethod(
    typedBody.passwordSignInMethod,
  )
  if (signInMethodResult.errorCode === 'invalid-sign-in-method') {
    return { errorCode: 'invalid-sign-in-method', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      role: userResult.result.role,
      passwordSignInMethod: signInMethodResult.result,
    },
  }
}

export function validateUserId(id: string | undefined): ValidateUserIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-user-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}

const isPasswordSignInMethodValid = ajv.compile<PasswordSignInMethod>({
  type: 'object',
  required: ['username', 'password'],
  additionalProperties: false,
  properties: {
    username: {
      type: 'string',
      minLength: 1,
    },
    password: {
      type: 'string',
      minLength: 1,
    },
  },
})

export function validatePasswordSignInMethod(
  request: unknown,
): PasswordSignInMethodValidationResult {
  if (!isPasswordSignInMethodValid(request)) {
    return { errorCode: 'invalid-sign-in-method', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      username: request.username,
      password: request.password,
    },
  }
}

const isPasswordChangeValid = ajv.compile<PasswordChange>({
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  additionalProperties: false,
  properties: {
    oldPassword: {
      type: 'string',
      minLength: 1,
    },
    newPassword: {
      type: 'string',
      minLength: 1,
    },
  },
})

export function validatePasswordChange(
  request: unknown,
): PasswordChangeValidationResult {
  if (!isPasswordChangeValid(request)) {
    return { errorCode: 'invalid-password-change', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword,
    },
  }
}
