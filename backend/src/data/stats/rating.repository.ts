import { sql } from 'kysely'

import type { Database } from '../database.js'

import type { StatsIdFilter } from './stats-filter.js'
import { idFilter } from './stats-filter.js'

interface RatingQueryResult {
  rating: number
  count: number
}

export type RatingStats = Array<{
  rating: string
  count: string
}>

export async function getRating(
  db: Database,
  statsFilter: StatsIdFilter,
): Promise<RatingStats> {
  const ratingQuery = sql<RatingQueryResult>`SELECT
    review.rating as rating,
    COUNT(1) as count
    FROM review ${idFilter(statsFilter)}
    GROUP BY review.rating
    ORDER BY review.rating ASC
  `

  const rating = await ratingQuery.execute(db.getDb())

  return rating.rows.map((row) => ({
    rating: `${row.rating}`,
    count: `${row.count}`,
  }))
}
