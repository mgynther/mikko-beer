import { sql } from 'kysely'

import type { Database } from '../database.js'

import type { RatingAggregateRow } from './review-stats.js'
import {
  percentileCont,
  ratingMode,
  stdDevPop,
  toReviewStats,
} from './review-stats.js'
import type { StatsIdFilter } from './stats-filter.js'
import { idFilter } from './stats-filter.js'

interface AnnualQueryResult extends RatingAggregateRow {
  year: number
}

export type AnnualStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export async function getAnnual(
  db: Database,
  statsFilter: StatsIdFilter,
): Promise<AnnualStats> {
  const annualQuery = sql<AnnualQueryResult>`SELECT
    COUNT(1) as review_count,
    AVG(review.rating) as review_average,
    ${stdDevPop} as stddev_pop,
    ${percentileCont} as percentile_cont,
    ${ratingMode} as mode,
    DATE_PART('YEAR', time) as year FROM review
    ${idFilter(statsFilter)}
    GROUP BY year
    ORDER BY year DESC
  `

  const annual = await annualQuery.execute(db.getDb())

  return annual.rows.map((row) => ({
    ...toReviewStats(row),
    year: `${row.year}`,
  }))
}
