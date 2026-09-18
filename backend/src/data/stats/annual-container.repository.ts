import { sql } from 'kysely'

import type { Database } from '../database.js'
import type { Pagination } from '../pagination.js'

import type { RatingAggregateRow } from './review-stats.js'
import {
  percentileCont,
  ratingMode,
  stdDevPop,
  toReviewStats,
} from './review-stats.js'
import type { StatsIdFilter } from './stats-filter.js'
import { idFilter } from './stats-filter.js'

interface AnnualContainerQueryResult extends RatingAggregateRow {
  container_id: string
  container_type: string
  container_size: string
  year: number
}

export type AnnualContainerStats = Array<{
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export async function getAnnualContainer(
  db: Database,
  pagination: Pagination,
  statsFilter: StatsIdFilter,
): Promise<AnnualContainerStats> {
  const annualContainerQuery = sql<AnnualContainerQueryResult>`SELECT
    COUNT(1) AS review_count,
    AVG(review.rating) as review_average,
    ${stdDevPop} as stddev_pop,
    ${percentileCont} as percentile_cont,
    ${ratingMode} as mode,
    DATE_PART('YEAR', review.time) AS year,
    review.container AS container_id,
    container.type AS container_type,
    container.size AS container_size FROM review
    JOIN container ON review.container = container.container_id
    ${idFilter(statsFilter)}
    GROUP BY year, review.container, container.type, container.size
    ORDER BY
      year DESC,
      container.type ASC,
      container.size ASC
    OFFSET ${pagination.skip}
    LIMIT ${pagination.size}
  `

  const annualContainer = await annualContainerQuery.execute(db.getDb())

  return annualContainer.rows.map((row) => ({
    ...toReviewStats(row),
    containerId: row.container_id,
    containerSize: row.container_size,
    containerType: row.container_type,
    year: `${row.year}`,
  }))
}
