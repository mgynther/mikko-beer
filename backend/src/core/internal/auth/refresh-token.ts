import { ajv } from '../ajv'

import { invalidRefreshTokenError } from '../../errors'
import type { RefreshToken } from '../../auth/refresh-token'

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
