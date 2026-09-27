export interface Pagination {
  size: number
  skip: number
}

export interface PaginationQuery {
  size: string | undefined
  skip: string | undefined
}

export type PaginationValidationResult =
  | {
      errorCode: 'invalid-pagination'
      result: undefined
    }
  | {
      errorCode: undefined
      result: Pagination
    }

export type ValidatePagination = (
  query: PaginationQuery,
) => PaginationValidationResult
