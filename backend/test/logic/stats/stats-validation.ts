import type { Pagination } from '../../../src/logic/pagination.js'
import type {
  BreweryCountryStatsOrder,
  BreweryStatsOrder,
  LocationStatsOrder,
  OrderedStatsQuery,
  StatsFilter,
  StatsIdFilter,
  StatsIdFilterQuery,
  StyleStatsOrder,
  ValidateAnnualContainerStats,
  ValidateBreweryCountryStats,
  ValidateBreweryStats,
  ValidateLocationStats,
  ValidateStatsFilter,
  ValidateStatsIdFilter,
  ValidateStyleStats,
} from '../../../src/logic/stats/stats.js'
import { passPaginationValidation } from '../pagination-validation.js'

// Queries as the request carries them when it leaves everything to the
// defaults.
export const defaultStatsIdFilterQuery: StatsIdFilterQuery = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

export const defaultOrderedStatsQuery: OrderedStatsQuery = {
  ...defaultStatsIdFilterQuery,
  minReviewCount: undefined,
  maxReviewCount: undefined,
  minReviewAverage: undefined,
  maxReviewAverage: undefined,
  timeStart: undefined,
  timeEnd: undefined,
  order: undefined,
  direction: undefined,
}

export function passStatsIdFilterValidation(
  filter: StatsIdFilter,
): ValidateStatsIdFilter {
  return () => ({ errorCode: undefined, result: filter })
}

export function passStatsFilterValidation(
  filter: StatsFilter,
): ValidateStatsFilter {
  return () => ({ errorCode: undefined, result: filter })
}

export function passAnnualContainerStatsValidation(
  pagination: Pagination,
  filter: StatsIdFilter,
): ValidateAnnualContainerStats {
  return {
    pagination: passPaginationValidation(pagination),
    filter: passStatsIdFilterValidation(filter),
  }
}

export function passBreweryStatsValidation(
  pagination: Pagination,
  filter: StatsFilter,
  order: BreweryStatsOrder,
): ValidateBreweryStats {
  return {
    pagination: passPaginationValidation(pagination),
    filter: passStatsFilterValidation(filter),
    order: () => ({ errorCode: undefined, result: order }),
  }
}

export function passBreweryCountryStatsValidation(
  pagination: Pagination,
  filter: StatsFilter,
  order: BreweryCountryStatsOrder,
): ValidateBreweryCountryStats {
  return {
    pagination: passPaginationValidation(pagination),
    filter: passStatsFilterValidation(filter),
    order: () => ({ errorCode: undefined, result: order }),
  }
}

export function passLocationStatsValidation(
  pagination: Pagination,
  filter: StatsFilter,
  order: LocationStatsOrder,
): ValidateLocationStats {
  return {
    pagination: passPaginationValidation(pagination),
    filter: passStatsFilterValidation(filter),
    order: () => ({ errorCode: undefined, result: order }),
  }
}

export function passStyleStatsValidation(
  filter: StatsFilter,
  order: StyleStatsOrder,
): ValidateStyleStats {
  return {
    filter: passStatsFilterValidation(filter),
    order: () => ({ errorCode: undefined, result: order }),
  }
}
