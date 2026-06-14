import type { YearMonthFilter } from '../../core/types'

export interface ReviewFilter {
  value: number
  setValue: (value: number) => void
}

export interface ReviewFilters {
  minRating: ReviewFilter
  maxRating: ReviewFilter
  minTime: YearMonthFilter
  maxTime: YearMonthFilter
}
