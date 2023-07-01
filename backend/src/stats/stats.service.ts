import * as statsRepository from './stats.repository'

import { type Database } from '../database'
import { type Pagination } from '../util/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type RatingStats,
  type StatsFilter,
  type StyleStats
} from './stats'

export async function getAnnual (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<AnnualStats> {
  return await statsRepository.getAnnual(db, statsFilter)
}

export async function getBrewery (
  db: Database,
  pagination: Pagination
): Promise<BreweryStats> {
  return await statsRepository.getBrewery(db, pagination)
}

export async function getOverall (
  db: Database
): Promise<OverallStats> {
  return await statsRepository.getOverall(db)
}

export async function getRating (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<RatingStats> {
  return await statsRepository.getRating(db, statsFilter)
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<StyleStats> {
  return await statsRepository.getStyle(db, statsFilter)
}
