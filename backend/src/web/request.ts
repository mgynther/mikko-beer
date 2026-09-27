import type { PaginationQuery } from './pagination.js'

export interface AuthorizedRequest {
  authorization: string | undefined
}

export interface BodyRequest extends AuthorizedRequest {
  body: unknown
}

export interface IdRequest extends AuthorizedRequest {
  id: string | undefined
}

export interface IdBodyRequest extends IdRequest {
  body: unknown
}

export interface PaginationRequest extends AuthorizedRequest {
  pagination: PaginationQuery
}
