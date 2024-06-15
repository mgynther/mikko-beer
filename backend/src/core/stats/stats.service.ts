import { type Pagination } from '../../core/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type BreweryStatsOrder,
  type OverallStats,
  type RatingStats,
  type StatsBreweryStyleFilter,
  type StatsFilter,
  type StyleStats,
  type StyleStatsOrder
} from '../../core/stats/stats'

// Test functionality if added. Left untested as there was no logic at the time
// of adding the file. However, it is used to enable adding logic later easily.

export async function getAnnual (
  getAnnual: (statsFilter: StatsBreweryStyleFilter) => Promise<AnnualStats>,
  statsFilter: StatsBreweryStyleFilter
): Promise<AnnualStats> {
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
  breweryStatsOrder: BreweryStatsOrder
): Promise<BreweryStats> {
  return await getBrewery(
    pagination,
    statsFilter,
    breweryStatsOrder
  )
}

export async function getOverall (
  getOverall: (statsFilter: StatsBreweryStyleFilter) => Promise<OverallStats>,
  statsFilter: StatsBreweryStyleFilter
): Promise<OverallStats> {
  return await getOverall(statsFilter)
}

export async function getRating (
  getRating: (statsFilter: StatsBreweryStyleFilter) => Promise<RatingStats>,
  statsFilter: StatsBreweryStyleFilter
): Promise<RatingStats> {
  return await getRating(statsFilter)
}

export async function getStyle (
  getStyle: (
    statsFilter: StatsFilter,
    styleStatsOrder: StyleStatsOrder
  ) => Promise<StyleStats>,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder
): Promise<StyleStats> {
  return await getStyle(statsFilter, styleStatsOrder)
}
