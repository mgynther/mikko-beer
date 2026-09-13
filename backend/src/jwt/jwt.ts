export type JwtClaims = Record<string, unknown>

export type VerifyJwtResult =
  | {
      errorCode: 'expired-jwt' | 'invalid-jwt'
      result: undefined
    }
  | {
      errorCode: undefined
      result: JwtClaims
    }
