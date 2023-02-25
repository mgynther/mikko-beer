import { ajv } from '../util/ajv'

export interface User {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
}

export interface CreateAnonymousUserRequest {
  firstName?: string
  lastName?: string
}

const doValidateCreateAnonymousUserRequest =
  ajv.compile<CreateAnonymousUserRequest>({
    type: 'object',
    properties: {
      firstName: {
        type: 'string'
      },
      lastName: {
        type: 'string'
      }
    }
  })

export function validateCreateAnonymousUserRequest (body: unknown): boolean {
  return doValidateCreateAnonymousUserRequest(body) as boolean
}
