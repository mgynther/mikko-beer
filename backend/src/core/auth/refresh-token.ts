import { ajv } from '../internal/ajv'

import { invalidRefreshTokenError } from '../errors'

export interface RefreshToken {
  refreshToken: string
}

export interface DbRefreshToken {
  id: string
  userId: string
}

const isRefreshTokenValid = ajv.compile<RefreshToken>({
  type: 'object',
  required: ['refreshToken'],
  additionalProperties: false,
  properties: {
    refreshToken: {
      type: 'string',
      minLength: 1
    }
  }
})

export function validateRefreshToken (request: unknown): RefreshToken {
  if (!isRefreshTokenValid(request)) {
    throw invalidRefreshTokenError
  }
  return {
    refreshToken: request.refreshToken
  }
}
