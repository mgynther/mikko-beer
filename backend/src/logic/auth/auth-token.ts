import type { Role } from '../user/user.js'

export interface AuthToken {
  authToken: string
}

export interface AuthTokenPayload {
  userId: string
  role: Role
  refreshTokenId: string
}

export interface AuthTokenConfig {
  secret: string
  expiryDurationMin: number
}

export class AuthTokenError extends Error {}
export class AuthTokenExpiredError extends AuthTokenError {}
export class InvalidAuthTokenError extends AuthTokenError {}

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

export type SignJwt = (
  claims: JwtClaims,
  secret: string,
  expiryDurationMin: number | undefined,
) => string

export type VerifyJwt = (token: string, secret: string) => VerifyJwtResult

export interface JwtIf {
  sign: SignJwt
  verify: VerifyJwt
}
