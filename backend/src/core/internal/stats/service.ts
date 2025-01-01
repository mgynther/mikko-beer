import type { Pagination } from '../../pagination'

import type {
  AnnualStats,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  OverallStats,
  RatingStats,
  StatsBreweryStyleFilter,
  StatsFilter,
  StyleStats,
  StyleStatsOrder
} from '../../stats/stats'

import type { log } from '../../log'
import { INFO } from '../../log'

// Test functionality if added. Left untested as there was no logic at the time
// of adding the file. However, it is used to enable adding logic later easily.

export async function getAnnual (
  getAnnual: (statsFilter: StatsBreweryStyleFilter) => Promise<AnnualStats>,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<AnnualStats> {
  log(INFO, 'get annual stats', statsFilter)
  return await getAnnual(statsFilter)
}

export async function getBrewery (
  getBrewery: (
    pagination: Pagination,
    statsFilter: StatsFilter,
    breweryStatsOrder: BreweryStatsOrder
  ) => Promise<BreweryStats>,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryStatsOrder: BreweryStatsOrder,
  log: log
): Promise<BreweryStats> {
  log(INFO, 'get brewery stats', statsFilter, breweryStatsOrder, pagination)
  return await getBrewery(
    pagination,
    statsFilter,
    breweryStatsOrder
  )
}

export async function getContainer (
  getContainer: (
    statsFilter: StatsBreweryStyleFilter
  ) => Promise<ContainerStats>,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<ContainerStats> {
  log(INFO, 'get container stats', statsFilter)
  return await getContainer(statsFilter)
}

export async function getOverall (
  getOverall: (statsFilter: StatsBreweryStyleFilter) => Promise<OverallStats>,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<OverallStats> {
  log(INFO, 'get overall stats', statsFilter)
  return await getOverall(statsFilter)
}

export async function getRating (
  getRating: (statsFilter: StatsBreweryStyleFilter) => Promise<RatingStats>,
  statsFilter: StatsBreweryStyleFilter,
  log: log
): Promise<RatingStats> {
  log(INFO, 'get rating stats', statsFilter)
  return await getRating(statsFilter)
}

export async function getStyle (
  getStyle: (
    statsFilter: StatsFilter,
    styleStatsOrder: StyleStatsOrder
  ) => Promise<StyleStats>,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder,
  log: log
): Promise<StyleStats> {
  log(INFO, 'get style stats', statsFilter)
  return await getStyle(statsFilter, styleStatsOrder)
}
