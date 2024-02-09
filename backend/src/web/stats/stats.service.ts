import * as statsRepository from '../../data/stats/stats.repository'

import { type Database } from '../../data/database'
import { type Pagination } from '../../core/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type BreweryStatsOrder,
  type OverallStats,
  type RatingStats,
  type StatsFilter,
  type StyleStats,
  type StyleStatsOrder
} from '../../core/stats/stats'

export async function getAnnual (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<AnnualStats> {
  return await statsRepository.getAnnual(db, statsFilter)
}

export async function getBrewery (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter | undefined,
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
  statsFilter: StatsFilter | undefined
): Promise<OverallStats> {
  return await statsRepository.getOverall(db, statsFilter)
}

export async function getRating (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<RatingStats> {
  return await statsRepository.getRating(db, statsFilter)
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter | undefined,
  styleStatsOrder: StyleStatsOrder
): Promise<StyleStats> {
  return await statsRepository.getStyle(db, statsFilter, styleStatsOrder)
}
