import type { Role } from '../user/user'

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
