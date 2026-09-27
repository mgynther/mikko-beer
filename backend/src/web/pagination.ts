export interface PaginationQuery {
  size: string | undefined
  skip: string | undefined
}

export interface Pagination {
  size: number
  skip: number
}
