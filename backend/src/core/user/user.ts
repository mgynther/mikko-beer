import { ajv } from '../ajv'

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

export interface CreateAnonymousUserRequest {
  role?: string
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

export function validateCreateAnonymousUserRequest (body: unknown): boolean {
  return doValidateCreateAnonymousUserRequest(body) as boolean
}
