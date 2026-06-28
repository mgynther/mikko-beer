import type {
  ListDirection,
  SearchParameters,
  YearMonth,
} from '../../core/types'
import { formatYearMonth, parseYearMonth } from '../common/filter-util'

export type FilterNumKey =
  's_min_count' | 's_max_count' | 's_min_avg' | 's_max_avg'

const filterNumDefaults: Record<FilterNumKey, number> = {
  s_min_count: 1,
  s_max_count: Infinity,
  s_min_avg: 4,
  s_max_avg: 10,
}

export function filterNumOrDefault(
  key: FilterNumKey,
  search: SearchParameters | undefined,
): number {
  const value = search?.get(key)
  if (value === undefined) {
    return filterNumDefaults[key]
  }
  const parsed = parseFloat(value)
  return isNaN(parsed) ? filterNumDefaults[key] : parsed
}

export function filtersOpenOrDefault(
  search: SearchParameters | undefined,
): boolean {
  const value = search?.get('s_filters')
  return value === '1'
}

export function filtersOpenStr(isOpen: boolean): string {
  return isOpen ? '1' : '0'
}

export function listDirectionOrDefault(
  search: SearchParameters | undefined,
): ListDirection {
  const value = search?.get('s_direction')
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
    minReviewCount: filterNumOrDefault('s_min_count', search),
    maxReviewCount: filterNumOrDefault('s_max_count', search),
    minReviewAverage: filterNumOrDefault('s_min_avg', search),
    maxReviewAverage: filterNumOrDefault('s_max_avg', search),
    timeStart: parseYearMonth(search?.get('s_time_start'), minTime),
    timeEnd: parseYearMonth(search?.get('s_time_end'), maxTime),
    isFiltersOpen: filtersOpenOrDefault(search),
  }
}

export interface SearchRecord {
  s_min_count: string
  s_max_count: string
  s_min_avg: string
  s_max_avg: string
  s_time_start: string
  s_time_end: string
  s_order: string
  s_direction: string
  s_filters: string
}

export function formatToSearch<T extends string>(
  statsParams: ParsedStatsParams<T>,
): SearchRecord {
  return {
    s_min_count: countStr(statsParams.minReviewCount),
    s_max_count: countStr(statsParams.maxReviewCount),
    s_min_avg: averageStr(statsParams.minReviewAverage),
    s_max_avg: averageStr(statsParams.maxReviewAverage),
    s_time_start: formatYearMonth(statsParams.timeStart),
    s_time_end: formatYearMonth(statsParams.timeEnd),
    s_order: statsParams.sortingOrder,
    s_direction: statsParams.sortingDirection,
    s_filters: filtersOpenStr(statsParams.isFiltersOpen),
  }
}
