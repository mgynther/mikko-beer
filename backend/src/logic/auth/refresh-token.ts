export interface DbRefreshToken {
  id: string
  userId: string
}

// Resolves to whether there was a refresh token to delete. A refresh token
// never expires, so its row is the only thing that revokes it.
export type DeleteRefreshToken = (refreshTokenId: string) => Promise<boolean>

export interface RefreshToken {
  refreshToken: string
}

export interface RefreshTokenPayload {
  userId: string
  refreshTokenId: string
  isRefreshToken: true
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
