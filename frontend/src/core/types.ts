export interface Pagination {
  size: number
  skip: number
}

export type NavMenuState = 'COLLAPSED' | 'EXPANDED'

export type Theme = 'LIGHT' | 'DARK'

export type InfiniteScroll = (loadMore: () => void) => () => void

export type ListDirection = 'asc' | 'desc'

export type UseDebounce<T> = (value: T, delay?: number) => [T, boolean]

export interface YearMonth {
  year: number
  month: number
}

export interface YearMonthFilter {
  min: YearMonth
  max: YearMonth
  value: YearMonth
  setValue: (yearMonth: YearMonth) => void
}

export interface SearchParameters {
  get: (name: string) => string | undefined
}

export type UseUrlSearchParams = () => SearchParameters
