export interface DbRefreshToken {
  id: string
  userId: string
}

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

export type ValidateRefreshToken = (
  request: unknown,
) => RefreshTokenValidationResult
