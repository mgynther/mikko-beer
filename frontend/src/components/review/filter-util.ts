import type { ReviewSorting, ReviewSortingOrder } from '../../core/review/types'
import type {
  ListDirection,
  SearchParameters,
  YearMonth,
} from '../../core/types'
import { formatYearMonth, parseYearMonth } from '../common/filter-util'

export type FilterNumKey = 'r_min_rating' | 'r_max_rating'

const filterNumDefaults: Record<FilterNumKey, number> = {
  r_min_rating: 4,
  r_max_rating: 10,
}

export function filterNumOrDefault(
  key: FilterNumKey,
  search: SearchParameters | undefined,
): number {
  const value = search?.get(key)
  return value === undefined ? filterNumDefaults[key] : parseFloat(value)
}

export function filtersOpenOrDefault(
  search: SearchParameters | undefined,
): boolean {
  const value = search?.get('r_filters')
  return value === '1'
}

export function filtersOpenStr(isOpen: boolean): string {
  return isOpen ? '1' : '0'
}

export function listDirectionOrDefault(
  search: SearchParameters | undefined,
  defaultDirection: ListDirection,
): ListDirection {
  const value = search?.get('r_direction')
  return value === 'asc' || value === 'desc' ? value : defaultDirection
}

function sortingOrderParser(
  search: SearchParameters | undefined,
  defaultOrder: ReviewSortingOrder,
): ReviewSortingOrder {
  const value = search?.get('r_order')
  return value === 'brewery_name' ||
    value === 'beer_name' ||
    value === 'rating' ||
    value === 'time'
    ? value
    : defaultOrder
}

export function ratingStr(num: number): string {
  return num.toFixed(0)
}

export interface ParsedReviewListParams {
  sortingOrder: ReviewSortingOrder
  sortingDirection: ListDirection
  minReviewRating: number
  maxReviewRating: number
  minTime: YearMonth
  maxTime: YearMonth
  isFiltersOpen: boolean
}

export function parseFromSearch(
  search: SearchParameters | undefined,
  initialSorting: ReviewSorting,
  minTime: YearMonth,
  maxTime: YearMonth,
): ParsedReviewListParams {
  return {
    sortingOrder: sortingOrderParser(search, initialSorting.order),
    sortingDirection: listDirectionOrDefault(search, initialSorting.direction),
    minReviewRating: filterNumOrDefault('r_min_rating', search),
    maxReviewRating: filterNumOrDefault('r_max_rating', search),
    minTime: parseYearMonth(search?.get('r_min_time'), minTime),
    maxTime: parseYearMonth(search?.get('r_max_time'), maxTime),
    isFiltersOpen: filtersOpenOrDefault(search),
  }
}

export interface SearchRecord {
  r_min_rating: string
  r_max_rating: string
  r_min_time: string
  r_max_time: string
  r_order: string
  r_direction: string
  r_filters: string
}

export function formatToSearch(
  statsParams: ParsedReviewListParams,
): SearchRecord {
  return {
    r_min_rating: ratingStr(statsParams.minReviewRating),
    r_max_rating: ratingStr(statsParams.maxReviewRating),
    r_min_time: formatYearMonth(statsParams.minTime),
    r_max_time: formatYearMonth(statsParams.maxTime),
    r_order: statsParams.sortingOrder,
    r_direction: statsParams.sortingDirection,
    r_filters: filtersOpenStr(statsParams.isFiltersOpen),
  }
}
