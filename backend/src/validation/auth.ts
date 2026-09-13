import { ajv } from './internal/ajv.js'

export interface RefreshToken {
  refreshToken: string
}

export type RefreshTokenValidationResult =
  | {
      errorCode: 'invalid-refresh-token'
      result: undefined
    }
  | {
      errorCode: undefined
      result: RefreshToken
    }

const isRefreshTokenValid = ajv.compile<RefreshToken>({
  type: 'object',
  required: ['refreshToken'],
  additionalProperties: false,
  properties: {
    refreshToken: {
      type: 'string',
      minLength: 1,
    },
  },
})

export function validateRefreshToken(
  request: unknown,
): RefreshTokenValidationResult {
  if (!isRefreshTokenValid(request)) {
    return { errorCode: 'invalid-refresh-token', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      refreshToken: request.refreshToken,
    },
  }
}
