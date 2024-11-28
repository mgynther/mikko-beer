export interface Pagination {
  size: number
  skip: number
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export type InfiniteScroll = (loadMore: () => void) => () => void

export type ListDirection = 'asc' | 'desc'

export type UseDebounce = (value: string, delay?: number) => string
