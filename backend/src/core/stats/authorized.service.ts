import * as authorizationService from '../internal/auth/authorization.service'
import * as statsService from '../internal/stats/service'

import type {
  AuthTokenPayload
} from "../auth/auth-token"
import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  LocationStats,
  LocationStatsOrder,
  OverallStats,
  RatingStats,
  StatsIdFilter,
  StatsFilter,
  StyleStats,
  StyleStatsOrder
} from "./stats"
import type { log } from '../log'
import type { Pagination } from '../pagination'

export async function getAnnual (
  getAnnual: (statsFilter: StatsIdFilter) => Promise<AnnualStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsIdFilter,
  log: log
): Promise<AnnualStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getAnnual(getAnnual, statsFilter, log)
}

export async function getAnnualContainer (
  getAnnualContainer: (
    pagination: Pagination,
    statsFilter: StatsIdFilter
  ) => Promise<AnnualContainerStats>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  statsFilter: StatsIdFilter,
  log: log
): Promise<AnnualStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getAnnualContainer(
    getAnnualContainer,
    pagination,
    statsFilter,
    log
  )
}

export async function getBrewery (
  getBrewery: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    breweryStatsOrder: BreweryStatsOrder
  ) => Promise<BreweryStats>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryStatsOrder: BreweryStatsOrder,
  log: log
): Promise<BreweryStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getBrewery(
    getBrewery,
    pagination,
    statsFilter,
    breweryStatsOrder,
    log
  )
}

export async function getContainer (
  getContainer: (
    statsFilter: StatsIdFilter
  ) => Promise<ContainerStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsIdFilter,
  log: log
): Promise<ContainerStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getContainer(getContainer, statsFilter, log)
}

export async function getLocation (
  getLocation: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    locationStatsOrder: LocationStatsOrder
  ) => Promise<LocationStats>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  statsFilter: StatsFilter,
  locationStatsOrder: LocationStatsOrder,
  log: log
): Promise<LocationStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getLocation(
    getLocation,
    pagination,
    statsFilter,
    locationStatsOrder,
    log
  )
}

export async function getOverall (
  getOverall: (statsFilter: StatsIdFilter) => Promise<OverallStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsIdFilter,
  log: log
): Promise<OverallStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getOverall(getOverall, statsFilter, log)
}

export async function getRating (
  getRating: (statsFilter: StatsIdFilter) => Promise<RatingStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsIdFilter,
  log: log
): Promise<RatingStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getRating(getRating, statsFilter, log)
}

export async function getStyle (
  getStyle: (
    statsFilter: StatsFilter,
    styleStatsOrder: StyleStatsOrder
  ) => Promise<StyleStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder,
  log: log
): Promise<StyleStats> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await statsService.getStyle(
    getStyle,
    statsFilter,
    styleStatsOrder,
    log
  )
}
