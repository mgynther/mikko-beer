import { ajv } from '../ajv'

export interface RefreshToken {
  refreshToken: string
}

export interface DbRefreshToken {
  id: string
  userId: string
}

export const validateRefreshToken = ajv.compile<RefreshToken>({
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string'
    }
  }
})
