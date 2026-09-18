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

interface ContainerQueryResult extends RatingAggregateRow {
  container_id: string
  container_size: string
  container_type: string
}

export type ContainerStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  containerId: string
  containerSize: string
  containerType: string
}>

export async function getContainer(
  db: Database,
  statsFilter: StatsIdFilter,
): Promise<ContainerStats> {
  const containerQuery = sql<ContainerQueryResult>`SELECT
    COUNT(1) as review_count,
    AVG(review.rating) as review_average,
    ${stdDevPop} as stddev_pop,
    ${percentileCont} as percentile_cont,
    ${ratingMode} as mode,
    review.container as container_id,
    container.size as container_size,
    container.type as container_type FROM review
    INNER JOIN container ON review.container = container.container_id
    ${idFilter(statsFilter)}
    GROUP BY review.container, container_size, container_type
    ORDER BY container_type ASC,
    container_size ASC
  `

  const container = await containerQuery.execute(db.getDb())

  return container.rows.map((row) => ({
    ...toReviewStats(row),
    containerId: row.container_id,
    containerSize: row.container_size,
    containerType: row.container_type,
  }))
}
