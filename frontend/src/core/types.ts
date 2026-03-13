export interface Pagination {
  size: number
  skip: number
}

export type Theme = 'LIGHT' | 'DARK'

export type InfiniteScroll = (loadMore: () => void) => () => void

export type ListDirection = 'asc' | 'desc'

export type UseDebounce<T> = (value: T, delay?: number) => [T, boolean]
