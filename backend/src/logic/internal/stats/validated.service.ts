import * as statsService from './service.js'

import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryCountryStats,
  BreweryCountryStatsOrder,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  LocationStats,
  LocationStatsOrder,
  OrderedStatsQuery,
  OverallStats,
  RatingStats,
  StatsFilter,
  StatsFilterQuery,
  StatsIdFilter,
  StatsIdFilterQuery,
  StatsOrderQuery,
  StyleStats,
  StyleStatsOrder,
  ValidateAnnualContainerStats,
  ValidateBreweryCountryStats,
  ValidateBreweryCountryStatsOrder,
  ValidateBreweryStats,
  ValidateBreweryStatsOrder,
  ValidateLocationStats,
  ValidateLocationStatsOrder,
  ValidateStatsFilter,
  ValidateStatsIdFilter,
  ValidateStyleStats,
  ValidateStyleStatsOrder,
} from '../../stats/stats.js'
import {
  invalidBreweryCountryStatsQueryError,
  invalidBreweryStatsQueryError,
  invalidIdFilterError,
  invalidLocationStatsQueryError,
  invalidStyleStatsQueryError,
} from '../../errors.js'
import type { log } from '../../log.js'
import type { Pagination, PaginationQuery } from '../../pagination.js'
import { validPagination } from '../pagination.js'

export async function getAnnual(
  getAnnual: (statsFilter: StatsIdFilter) => Promise<AnnualStats>,
  validateFilter: ValidateStatsIdFilter,
  query: StatsIdFilterQuery,
  log: log,
): Promise<AnnualStats> {
  const statsFilter = validIdFilter(validateFilter, query)
  return await statsService.getAnnual(getAnnual, statsFilter, log)
}

export async function getAnnualContainer(
  getAnnualContainer: (
    pagination: Pagination,
    statsFilter: StatsIdFilter,
  ) => Promise<AnnualContainerStats>,
  validate: ValidateAnnualContainerStats,
  paginationQuery: PaginationQuery,
  query: StatsIdFilterQuery,
  log: log,
): Promise<AnnualContainerStats> {
  const statsFilter = validIdFilter(validate.filter, query)
  const pagination = validPagination(validate.pagination, paginationQuery)
  return await statsService.getAnnualContainer(
    getAnnualContainer,
    pagination,
    statsFilter,
    log,
  )
}

export async function getBrewery(
  getBrewery: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    breweryStatsOrder: BreweryStatsOrder,
  ) => Promise<BreweryStats>,
  validate: ValidateBreweryStats,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<BreweryStats> {
  const pagination = validPagination(validate.pagination, paginationQuery)
  const statsFilter = validFilter(validate.filter, query)
  const breweryStatsOrder = validBreweryOrder(validate.order, query)
  return await statsService.getBrewery(
    getBrewery,
    pagination,
    statsFilter,
    breweryStatsOrder,
    log,
  )
}

export async function getBreweryCountry(
  getBreweryCountry: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    breweryCountryStatsOrder: BreweryCountryStatsOrder,
  ) => Promise<BreweryCountryStats>,
  validate: ValidateBreweryCountryStats,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<BreweryCountryStats> {
  const pagination = validPagination(validate.pagination, paginationQuery)
  const statsFilter = validFilter(validate.filter, query)
  const breweryCountryStatsOrder = validBreweryCountryOrder(
    validate.order,
    query,
  )
  return await statsService.getBreweryCountry(
    getBreweryCountry,
    pagination,
    statsFilter,
    breweryCountryStatsOrder,
    log,
  )
}

export async function getContainer(
  getContainer: (statsFilter: StatsIdFilter) => Promise<ContainerStats>,
  validateFilter: ValidateStatsIdFilter,
  query: StatsIdFilterQuery,
  log: log,
): Promise<ContainerStats> {
  const statsFilter = validIdFilter(validateFilter, query)
  return await statsService.getContainer(getContainer, statsFilter, log)
}

export async function getLocation(
  getLocation: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    locationStatsOrder: LocationStatsOrder,
  ) => Promise<LocationStats>,
  validate: ValidateLocationStats,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<LocationStats> {
  const pagination = validPagination(validate.pagination, paginationQuery)
  const statsFilter = validFilter(validate.filter, query)
  const locationStatsOrder = validLocationOrder(validate.order, query)
  return await statsService.getLocation(
    getLocation,
    pagination,
    statsFilter,
    locationStatsOrder,
    log,
  )
}

export async function getOverall(
  getOverall: (statsFilter: StatsIdFilter) => Promise<OverallStats>,
  validateFilter: ValidateStatsIdFilter,
  query: StatsIdFilterQuery,
  log: log,
): Promise<OverallStats> {
  const statsFilter = validIdFilter(validateFilter, query)
  return await statsService.getOverall(getOverall, statsFilter, log)
}

export async function getRating(
  getRating: (statsFilter: StatsIdFilter) => Promise<RatingStats>,
  validateFilter: ValidateStatsIdFilter,
  query: StatsIdFilterQuery,
  log: log,
): Promise<RatingStats> {
  const statsFilter = validIdFilter(validateFilter, query)
  return await statsService.getRating(getRating, statsFilter, log)
}

export async function getStyle(
  getStyle: (
    statsFilter: StatsFilter,
    styleStatsOrder: StyleStatsOrder,
  ) => Promise<StyleStats>,
  validate: ValidateStyleStats,
  query: OrderedStatsQuery,
  log: log,
): Promise<StyleStats> {
  const styleStatsOrder = validStyleOrder(validate.order, query)
  const statsFilter = validFilter(validate.filter, query)
  return await statsService.getStyle(
    getStyle,
    statsFilter,
    styleStatsOrder,
    log,
  )
}

function validIdFilter(
  validateFilter: ValidateStatsIdFilter,
  query: StatsIdFilterQuery,
): StatsIdFilter {
  const validationResult = validateFilter(query)
  if (validationResult.errorCode === 'invalid-id-filter') {
    throw invalidIdFilterError
  }
  return validationResult.result
}

function validFilter(
  validateFilter: ValidateStatsFilter,
  query: StatsFilterQuery,
): StatsFilter {
  const validationResult = validateFilter(query)
  if (validationResult.errorCode === 'invalid-id-filter') {
    throw invalidIdFilterError
  }
  return validationResult.result
}

function validBreweryCountryOrder(
  validateOrder: ValidateBreweryCountryStatsOrder,
  query: StatsOrderQuery,
): BreweryCountryStatsOrder {
  const validationResult = validateOrder(query)
  if (validationResult.errorCode === 'invalid-brewery-country-stats-query') {
    throw invalidBreweryCountryStatsQueryError
  }
  return validationResult.result
}

function validBreweryOrder(
  validateOrder: ValidateBreweryStatsOrder,
  query: StatsOrderQuery,
): BreweryStatsOrder {
  const validationResult = validateOrder(query)
  if (validationResult.errorCode === 'invalid-brewery-stats-query') {
    throw invalidBreweryStatsQueryError
  }
  return validationResult.result
}

function validLocationOrder(
  validateOrder: ValidateLocationStatsOrder,
  query: StatsOrderQuery,
): LocationStatsOrder {
  const validationResult = validateOrder(query)
  if (validationResult.errorCode === 'invalid-location-stats-query') {
    throw invalidLocationStatsQueryError
  }
  return validationResult.result
}

function validStyleOrder(
  validateOrder: ValidateStyleStatsOrder,
  query: StatsOrderQuery,
): StyleStatsOrder {
  const validationResult = validateOrder(query)
  if (validationResult.errorCode === 'invalid-style-stats-query') {
    throw invalidStyleStatsQueryError
  }
  return validationResult.result
}
