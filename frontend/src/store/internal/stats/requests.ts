import type { Pagination } from '../pagination'
import type { ListDirection } from '../review/requests'

export interface IdParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

export interface AnnualContainerStatsQueryParams extends IdParams {
  pagination: Pagination
}

export type BreweryCountryStatsSortingOrder =
  'average' | 'brewery_count' | 'count' | 'country_code' | 'std_dev'

export interface BreweryCountryStatsSorting {
  order: BreweryCountryStatsSortingOrder
  direction: ListDirection
}

export type BreweryStatsSortingOrder =
  'average' | 'brewery_name' | 'count' | 'std_dev'

export interface BreweryStatsSorting {
  order: BreweryStatsSortingOrder
  direction: ListDirection
}

export type LocationStatsSortingOrder =
  'average' | 'location_name' | 'count' | 'std_dev'

export interface LocationStatsSorting {
  order: LocationStatsSortingOrder
  direction: ListDirection
}

export type StyleStatsSortingOrder =
  'average' | 'style_name' | 'count' | 'std_dev'

export interface StyleStatsSorting {
  order: StyleStatsSortingOrder
  direction: ListDirection
}

// The review count, average and time bounds every filtered stats query
// carries.
interface StatsFilter extends IdParams {
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: number
  timeEnd: number
}

export interface BreweryCountryStatsQueryParams extends StatsFilter {
  pagination: Pagination
  sorting: BreweryCountryStatsSorting
}

export interface BreweryStatsQueryParams extends StatsFilter {
  pagination: Pagination
  sorting: BreweryStatsSorting
}

export interface LocationStatsQueryParams extends StatsFilter {
  pagination: Pagination
  sorting: LocationStatsSorting
}

export interface StyleStatsQueryParams extends StatsFilter {
  sorting: StyleStatsSorting
}
