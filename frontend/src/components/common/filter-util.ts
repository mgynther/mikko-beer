import type { YearMonth } from '../../core/stats/types'
import { pad } from '../util'

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
