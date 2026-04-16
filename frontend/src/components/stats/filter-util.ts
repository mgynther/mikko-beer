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
  search: SearchParameters,
): number {
  const value = search.get(key)
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

export function filtersOpenOrDefault(search: SearchParameters): boolean {
  const value = search.get('filters_open')
  return value === '1'
}

export function filtersOpenStr(isOpen: boolean): string {
  return isOpen ? '1' : '0'
}

export function listDirectionOrDefault(
  search: SearchParameters,
): ListDirection {
  const value = search.get('list_direction')
  return value === 'asc' || value === 'desc' ? value : 'asc'
}

export function averageStr(num: number): string {
  return num.toFixed(2)
}

export function countStr(num: number): string {
  return num.toFixed(0)
}
