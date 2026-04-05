import { ajv } from '../ajv.js'

import { invalidRefreshTokenError } from '../../errors.js'
import type { RefreshToken } from '../../auth/refresh-token.js'

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
