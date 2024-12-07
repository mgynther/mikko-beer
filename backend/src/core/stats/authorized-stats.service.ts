import * as authService from '../../core/auth/auth.service'
import * as statsService from '../../core/stats/stats.service'

import type {
  AuthTokenPayload
} from "../auth/auth-token"
import type {
  AnnualStats,
  BreweryStats,
  BreweryStatsOrder,
  OverallStats,
  RatingStats,
  StatsBreweryStyleFilter,
  StatsFilter,
  StyleStats,
  StyleStatsOrder
} from "./stats"
import type { log } from '../log'
import type { Pagination } from '../pagination'

export async function getAnnual (
  getAnnual: (statsFilter: StatsBreweryStyleFilter) => Promise<AnnualStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<AnnualStats> {
  authService.authorizeViewer(authTokenPayload)
  return await statsService.getAnnual(getAnnual, statsFilter, log)
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
  authService.authorizeViewer(authTokenPayload)
  return await statsService.getBrewery(
    getBrewery,
    pagination,
    statsFilter,
    breweryStatsOrder,
    log
  )
}

export async function getOverall (
  getOverall: (statsFilter: StatsBreweryStyleFilter) => Promise<OverallStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<OverallStats> {
  authService.authorizeViewer(authTokenPayload)
  return await statsService.getOverall(getOverall, statsFilter, log)
}

export async function getRating (
  getRating: (statsFilter: StatsBreweryStyleFilter) => Promise<RatingStats>,
  authTokenPayload: AuthTokenPayload,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<RatingStats> {
  authService.authorizeViewer(authTokenPayload)
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
  authService.authorizeViewer(authTokenPayload)
  return await statsService.getStyle(
    getStyle,
    statsFilter,
    styleStatsOrder,
    log
  )
}
