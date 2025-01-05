import type { ListDirection } from "../../core/types"
import type { SearchParameters } from "../util"

export type FilterNumKey =
  | 'min_review_count'
  | 'max_review_count'
  | 'min_review_average'
  | 'max_review_average'

const filterNumDefaults: Record<FilterNumKey, number> = {
  min_review_count: 1,
  max_review_count: Infinity,
  min_review_average: 4,
  max_review_average: 10
}

export function filterNumOrDefault (
  key: FilterNumKey,
  search: SearchParameters
): number {
  const value = search.get(key)
  return value === undefined ? filterNumDefaults[key] : parseFloat(value)
}

export function listDirectionOrDefault (search: SearchParameters): ListDirection {
  const value = search.get('list_direction')
  return value === 'asc' || value === 'desc'
    ? value : 'asc'
}

export function averageStr (num: number): string {
  return num.toFixed(2)
}

export function countStr (num: number): string {
  return num.toFixed(0)
}
