import type { YearMonth } from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import { pad } from '../util'
import type { SearchParameters } from '../util'

export type FilterNumKey =
  | 'min_review_count'
  | 'max_review_count'
  | 'min_review_average'
  | 'max_review_average'

const filterNumDefaults: Record<FilterNumKey, number> = {
  min_review_count: 1,
  max_review_count: Infinity,
  min_review_average: 4,
  max_review_average: 10,
}

export function filterNumOrDefault(
  key: FilterNumKey,
  search: SearchParameters | undefined,
): number {
  const value = search?.get(key)
  return value === undefined ? filterNumDefaults[key] : parseFloat(value)
}

export function formatYearMonth(yearMonth: YearMonth): string {
  return `${yearMonth.year}-${pad(yearMonth.month)}`
}

export function toTimestamp(
  yearMonth: YearMonth,
  mode: 'start' | 'end',
): number {
  if (mode === 'start') {
    return new Date(yearMonth.year, yearMonth.month - 1, 1).getTime()
  }
  const endDate = new Date(yearMonth.year, yearMonth.month, 0, 23, 59, 59)
  return endDate.getTime()
}

export function parseYearMonth(
  str: string | undefined,
  defaultValue: YearMonth,
): YearMonth {
  const fallback = { ...defaultValue }
  if (str === undefined) {
    return fallback
  }
  const parts = str.split('-')
  if (parts.length !== 2) {
    return fallback
  }
  const parsedYear = parseInt(parts[0])
  if (isNaN(parsedYear) || parsedYear <= 0) {
    return fallback
  }
  const parsedMonth = parseInt(parts[1])
  if (isNaN(parsedMonth) || parsedMonth <= 0 || parsedMonth > 12) {
    return fallback
  }
  return {
    year: parsedYear,
    month: parsedMonth,
  }
}

export function filtersOpenOrDefault(
  search: SearchParameters | undefined,
): boolean {
  const value = search?.get('filters_open')
  return value === '1'
}

export function filtersOpenStr(isOpen: boolean): string {
  return isOpen ? '1' : '0'
}

export function listDirectionOrDefault(
  search: SearchParameters | undefined,
): ListDirection {
  const value = search?.get('list_direction')
  return value === 'asc' || value === 'desc' ? value : 'asc'
}

export function averageStr(num: number): string {
  return num.toFixed(2)
}

export function countStr(num: number): string {
  return num.toFixed(0)
}

export interface ParsedStatsParams<T extends string> {
  sortingOrder: T
  sortingDirection: ListDirection
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: YearMonth
  timeEnd: YearMonth
  isFiltersOpen: boolean
}

export function parseFromSearch<T extends string>(
  search: SearchParameters | undefined,
  minTime: YearMonth,
  maxTime: YearMonth,
  sortingOrderParser: (search: SearchParameters | undefined) => T,
): ParsedStatsParams<T> {
  return {
    sortingOrder: sortingOrderParser(search),
    sortingDirection: listDirectionOrDefault(search),
    minReviewCount: filterNumOrDefault('min_review_count', search),
    maxReviewCount: filterNumOrDefault('max_review_count', search),
    minReviewAverage: filterNumOrDefault('min_review_average', search),
    maxReviewAverage: filterNumOrDefault('max_review_average', search),
    timeStart: parseYearMonth(search?.get('time_start'), minTime),
    timeEnd: parseYearMonth(search?.get('time_end'), maxTime),
    isFiltersOpen: filtersOpenOrDefault(search),
  }
}

export interface SearchRecord {
  min_review_count: string
  max_review_count: string
  min_review_average: string
  max_review_average: string
  time_start: string
  time_end: string
  sorting_order: string
  list_direction: string
  filters_open: string
}

export function formatToSearch<T extends string>(
  statsParams: ParsedStatsParams<T>,
): SearchRecord {
  return {
    min_review_count: countStr(statsParams.minReviewCount),
    max_review_count: countStr(statsParams.maxReviewCount),
    min_review_average: averageStr(statsParams.minReviewAverage),
    max_review_average: averageStr(statsParams.maxReviewAverage),
    time_start: formatYearMonth(statsParams.timeStart),
    time_end: formatYearMonth(statsParams.timeEnd),
    sorting_order: statsParams.sortingOrder,
    list_direction: statsParams.sortingDirection,
    filters_open: filtersOpenStr(statsParams.isFiltersOpen),
  }
}
