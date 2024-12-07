import type { AuthTokenPayload } from "./auth/auth-token"
import type { Pagination } from "./pagination"
import type { SearchByName } from "./search"

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
  pagination: Pagination
}

export interface SearchByNameRequest {
  authTokenPayload: AuthTokenPayload
  searchByName: SearchByName
}
