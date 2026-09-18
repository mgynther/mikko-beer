import { sql } from 'kysely'

import { round, formatInteger } from './format.js'

// The rating aggregates every stats query selects. They are plain named
// fragments rather than a query helper: each reads as what it computes,
// and the Kysely queries use them as `stdDevPop.as('stddev_pop')` while
// the raw SQL ones splice them in as `${stdDevPop}`.
//
// MODE() WITHIN GROUP (ORDER BY review.rating ASC): on ties, Postgres
// returns the lowest tied rating. This invariant must be replicated in
// the test helpers.
export const stdDevPop = sql<number>`STDDEV_POP(review.rating)`
export const percentileCont = sql<number>`PERCENTILE_CONT(0.5)
  WITHIN GROUP (ORDER BY review.rating)`
export const ratingMode = sql<number>`MODE()
  WITHIN GROUP (ORDER BY review.rating ASC)`

export interface RatingAggregateRow {
  review_average: number
  review_count: number
  stddev_pop: number
  percentile_cont: number
  mode: number
}

export interface ReviewStats {
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
}

// The one place that decides how each aggregate is formatted: the mode is
// a rating and rounds to an integer, the rest keep two decimals.
export function toReviewStats(row: RatingAggregateRow): ReviewStats {
  return {
    reviewAverage: round(row.review_average),
    reviewCount: `${row.review_count}`,
    reviewStandardDeviation: round(row.stddev_pop),
    reviewMedian: round(row.percentile_cont),
    reviewMode: formatInteger(row.mode),
  }
}
