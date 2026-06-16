import type { YearMonthFilter } from '../../core/types'

export interface StatsFilter {
  value: number
  setValue: (value: number) => void
}

export interface StatsFilters {
  minReviewCount: StatsFilter
  maxReviewCount: StatsFilter
  minReviewAverage: StatsFilter
  maxReviewAverage: StatsFilter
  timeStart: YearMonthFilter
  timeEnd: YearMonthFilter
}

export interface StatsNoTimeFilters {
  minReviewCount: StatsFilter
  maxReviewCount: StatsFilter
  minReviewAverage: StatsFilter
  maxReviewAverage: StatsFilter
}

export interface StatsFilterState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  filters: StatsFilters
}

export interface StatsNoTimeFilterState {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  filters: StatsNoTimeFilters
}
