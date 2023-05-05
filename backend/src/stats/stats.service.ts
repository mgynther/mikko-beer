import * as statsRepository from './stats.repository'

import { type Database } from '../database'
import { type Pagination } from '../util/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type StyleStats
} from './stats'

export async function getAnnual (
  db: Database
): Promise<AnnualStats> {
  return await statsRepository.getAnnual(db)
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

export async function getStyle (
  db: Database
): Promise<StyleStats> {
  return await statsRepository.getStyle(db)
}
