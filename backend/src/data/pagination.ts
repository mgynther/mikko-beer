export interface Pagination {
  size: number
  skip: number
}

interface RowNumbers {
  start: number
  end: number
}

export function toRowNumbers(pagination: Pagination): RowNumbers {
  const start = pagination.skip + 1
  const end = pagination.skip + pagination.size
  return { start, end }
}
