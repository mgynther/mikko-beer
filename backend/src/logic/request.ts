import type { AuthTokenPayload } from './auth/auth-token'
import type { PaginationQuery } from './pagination'

export interface BodyRequest {
  authTokenPayload: AuthTokenPayload
  body: unknown
}

export interface IdRequest {
  authTokenPayload: AuthTokenPayload
  id: string | undefined
}

export interface PaginationRequest {
  authTokenPayload: AuthTokenPayload
  pagination: PaginationQuery
}
