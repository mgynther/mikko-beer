export interface Pagination {
  size: number
  skip: number
}

export type ListDirection = 'asc' | 'desc'

export type UseDebounce = (value: string, delay?: number) => string
