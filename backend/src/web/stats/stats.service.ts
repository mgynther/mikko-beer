import * as statsRepository from '../../data/stats/stats.repository'

import { type Database } from '../../data/database'
import { type Pagination } from '../../core/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type BreweryStatsOrder,
  type OverallStats,
  type RatingStats,
  type StatsBreweryFilter,
  type StatsFilter,
  type StyleStats,
  type StyleStatsOrder
} from '../../core/stats/stats'

export async function getAnnual (
  db: Database,
  statsFilter: StatsBreweryFilter | undefined
): Promise<AnnualStats> {
  return await statsRepository.getAnnual(db, statsFilter)
}

export async function getBrewery (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryStatsOrder: BreweryStatsOrder
): Promise<BreweryStats> {
  return await statsRepository.getBrewery(
    db,
    pagination,
    statsFilter,
    breweryStatsOrder
  )
}

export async function getOverall (
  db: Database,
  statsFilter: StatsBreweryFilter | undefined
): Promise<OverallStats> {
  return await statsRepository.getOverall(db, statsFilter)
}

export async function getRating (
  db: Database,
  statsFilter: StatsBreweryFilter | undefined
): Promise<RatingStats> {
  return await statsRepository.getRating(db, statsFilter)
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder
): Promise<StyleStats> {
  return await statsRepository.getStyle(db, statsFilter, styleStatsOrder)
}
