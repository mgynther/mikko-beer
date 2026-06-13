import type { YearMonthFilter } from '../../core/stats/types'

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
