import * as authorizationService from '../internal/auth/authorization.service.js'
import * as statsService from '../internal/stats/validated.service.js'

import type { AuthTokenPayload } from '../auth/auth-token'
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
  StatsIdFilter,
  StatsIdFilterQuery,
  StyleStats,
  StyleStatsOrder,
  ValidateAnnualContainerStats,
  ValidateBreweryCountryStats,
  ValidateBreweryStats,
  ValidateLocationStats,
  ValidateStatsIdFilter,
  ValidateStyleStats,
} from './stats'
import type { log } from '../log.js'
import type { Pagination, PaginationQuery } from '../pagination.js'

export async function getAnnual(
  getAnnual: (statsFilter: StatsIdFilter) => Promise<AnnualStats>,
  validateFilter: ValidateStatsIdFilter,
  authTokenPayload: AuthTokenPayload,
  query: StatsIdFilterQuery,
  log: log,
): Promise<AnnualStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getAnnual(getAnnual, validateFilter, query, log)
}

export async function getAnnualContainer(
  getAnnualContainer: (
    pagination: Pagination,
    statsFilter: StatsIdFilter,
  ) => Promise<AnnualContainerStats>,
  validate: ValidateAnnualContainerStats,
  authTokenPayload: AuthTokenPayload,
  paginationQuery: PaginationQuery,
  query: StatsIdFilterQuery,
  log: log,
): Promise<AnnualContainerStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getAnnualContainer(
    getAnnualContainer,
    validate,
    paginationQuery,
    query,
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
  authTokenPayload: AuthTokenPayload,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<BreweryStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getBrewery(
    getBrewery,
    validate,
    paginationQuery,
    query,
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
  authTokenPayload: AuthTokenPayload,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<BreweryCountryStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getBreweryCountry(
    getBreweryCountry,
    validate,
    paginationQuery,
    query,
    log,
  )
}

export async function getContainer(
  getContainer: (statsFilter: StatsIdFilter) => Promise<ContainerStats>,
  validateFilter: ValidateStatsIdFilter,
  authTokenPayload: AuthTokenPayload,
  query: StatsIdFilterQuery,
  log: log,
): Promise<ContainerStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getContainer(
    getContainer,
    validateFilter,
    query,
    log,
  )
}

export async function getLocation(
  getLocation: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    locationStatsOrder: LocationStatsOrder,
  ) => Promise<LocationStats>,
  validate: ValidateLocationStats,
  authTokenPayload: AuthTokenPayload,
  paginationQuery: PaginationQuery,
  query: OrderedStatsQuery,
  log: log,
): Promise<LocationStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getLocation(
    getLocation,
    validate,
    paginationQuery,
    query,
    log,
  )
}

export async function getOverall(
  getOverall: (statsFilter: StatsIdFilter) => Promise<OverallStats>,
  validateFilter: ValidateStatsIdFilter,
  authTokenPayload: AuthTokenPayload,
  query: StatsIdFilterQuery,
  log: log,
): Promise<OverallStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getOverall(getOverall, validateFilter, query, log)
}

export async function getRating(
  getRating: (statsFilter: StatsIdFilter) => Promise<RatingStats>,
  validateFilter: ValidateStatsIdFilter,
  authTokenPayload: AuthTokenPayload,
  query: StatsIdFilterQuery,
  log: log,
): Promise<RatingStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getRating(getRating, validateFilter, query, log)
}

export async function getStyle(
  getStyle: (
    statsFilter: StatsFilter,
    styleStatsOrder: StyleStatsOrder,
  ) => Promise<StyleStats>,
  validate: ValidateStyleStats,
  authTokenPayload: AuthTokenPayload,
  query: OrderedStatsQuery,
  log: log,
): Promise<StyleStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getStyle(getStyle, validate, query, log)
}
