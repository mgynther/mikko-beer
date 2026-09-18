import type { RawBuilder } from 'kysely'
import { sql } from 'kysely'

export interface StatsIdFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
}

export interface StatsFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
  maxReviewCount: number
  minReviewCount: number
  maxReviewAverage: number
  minReviewAverage: number
  timeStart: Date | undefined
  timeEnd: Date | undefined
}

export function noInfinity(value: number): number {
  if (value > 0 && !Number.isFinite(value)) {
    return 10000000
  }
  return value
}

// The id filter of the raw SQL stats queries. It emits the joins the
// filter needs and the complete WHERE clause, so the caller supplies
// neither, and it emits nothing when nothing is filtered.
export function idFilter(statsFilter: StatsIdFilter): RawBuilder<unknown> {
  const beerJoins: Array<RawBuilder<unknown>> = []
  const conditions: Array<RawBuilder<unknown>> = []

  if (statsFilter.brewery !== undefined) {
    beerJoins.push(
      sql`INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer`,
    )
    conditions.push(sql`beer_brewery.brewery = ${statsFilter.brewery}`)
  }
  if (statsFilter.location !== undefined) {
    conditions.push(sql`review.location = ${statsFilter.location}`)
  }
  if (statsFilter.style !== undefined) {
    beerJoins.push(sql`INNER JOIN beer_style ON beer.beer_id = beer_style.beer`)
    conditions.push(sql`beer_style.style = ${statsFilter.style}`)
  }

  // Both joins above hang off beer, which is therefore joined once when
  // either of them is needed and not at all when neither is.
  const joins =
    beerJoins.length === 0
      ? sql``
      : sql`INNER JOIN beer ON review.beer = beer.beer_id
          ${sql.join(beerJoins, sql` `)}`
  const where =
    conditions.length === 0
      ? sql``
      : sql`WHERE ${sql.join(conditions, sql` AND `)}`

  return sql`${joins} ${where}`
}
