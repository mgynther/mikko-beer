import { sql } from 'kysely'

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

// TODO try converting raw sql queries to Kysely for automatic types.
function round (value: number, decimals: number): string {
  return Number(
    `${Math.round(parseFloat(`${value}e${decimals}`))}e-${decimals}`
  ).toFixed(decimals)
}

export async function getAnnual (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<AnnualStats> {
  const annualQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    DATE_PART('YEAR', time) as year FROM review
    ${statsFilter === undefined
      ? sql``
      : sql`
      INNER JOIN beer ON review.beer = beer.beer_id
      INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
      WHERE beer_brewery.brewery = ${statsFilter.brewery}
      `
    }
    GROUP BY year
    ORDER BY year ASC
  `

  const annual = (await annualQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      year: number
    }>
  })

  return annual.rows.map(row => ({
    reviewAverage: round(row.review_average, 2),
    reviewCount: `${row.review_count}`,
    year: `${row.year}`
  }))
}

export async function getBrewery (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter | undefined
): Promise<BreweryStats> {
  let breweryQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    brewery.brewery_id as brewery_id,
    brewery.name as brewery_name
    FROM review
    INNER JOIN beer ON review.beer = beer.beer_id
    INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
    INNER JOIN brewery ON beer_brewery.brewery = brewery.brewery_id
    GROUP BY brewery_id
    ORDER BY brewery_name ASC
    OFFSET ${pagination.skip}
    LIMIT ${pagination.size}
  `

  if (statsFilter !== undefined) {
    breweryQuery = sql`SELECT
      COUNT(review) AS review_count,
      AVG(review.rating) AS review_average,
      brewery.brewery_id AS brewery_id,
      brewery.name AS brewery_name
      FROM beer_brewery AS querybrewery
      INNER JOIN beer ON querybrewery.beer = beer.beer_id
      INNER JOIN review ON beer.beer_id = review.beer
      INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
      INNER JOIN brewery ON beer_brewery.brewery = brewery.brewery_id
      WHERE querybrewery.brewery = ${statsFilter.brewery}
      GROUP BY brewery_id
      ORDER BY brewery_name ASC
      OFFSET ${pagination.skip}
      LIMIT ${pagination.size}
    `
  }

  const brewery = (await breweryQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      brewery_id: string
      brewery_name: string
    }>
  })

  return brewery.rows.map(row => ({
    reviewAverage: round(row.review_average, 2),
    reviewCount: `${row.review_count}`,
    breweryId: row.brewery_id,
    breweryName: row.brewery_name
  }))
}

export async function getOverall (
  db: Database
): Promise<OverallStats> {
  const statsQuery = sql`SELECT
    (SELECT COUNT(1) FROM beer) AS beer_count,
    (SELECT COUNT(1) FROM brewery) AS brewery_count,
    (SELECT COUNT(1) FROM container) AS container_count,
    (SELECT COUNT(1) FROM review) AS review_count,
    (SELECT COUNT(1) FROM style) AS style_count,
    (SELECT AVG(rating) FROM review) AS review_average
  `
  const stats = (await statsQuery
    .execute(db.getDb()) as {
    rows: Array<{
      beer_count: number
      brewery_count: number
      container_count: number
      review_count: number
      review_average: number
      style_count: number
    }>
  }).rows[0]

  return {
    beerCount: `${stats.beer_count}`,
    breweryCount: `${stats.brewery_count}`,
    containerCount: `${stats.container_count}`,
    reviewAverage: round(stats.review_average, 2),
    reviewCount: `${stats.review_count}`,
    styleCount: `${stats.style_count}`
  }
}

export async function getRating (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<RatingStats> {
  const styleQuery = sql`SELECT
    review.rating as rating,
    COUNT(1) as count
    FROM review
    ${statsFilter === undefined
      ? sql``
      : sql`
      INNER JOIN beer ON review.beer = beer.beer_id
      INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
      WHERE beer_brewery.brewery = ${statsFilter.brewery}
      `
    }
    GROUP BY review.rating
    ORDER BY review.rating ASC
  `

  const style = (await styleQuery
    .execute(db.getDb()) as {
    rows: Array<{
      rating: number
      count: number
    }>
  })

  return style.rows.map(row => ({
    rating: `${row.rating}`,
    count: `${row.count}`
  }))
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<StyleStats> {
  const styleQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    style.style_id as style_id,
    style.name as style_name
    FROM review
    INNER JOIN beer ON review.beer = beer.beer_id
    ${statsFilter === undefined
      ? sql``
      : sql`INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer`
    }
    INNER JOIN beer_style ON beer.beer_id = beer_style.beer
    INNER JOIN style ON beer_style.style = style.style_id
    ${statsFilter === undefined
      ? sql``
      : sql`WHERE beer_brewery.brewery = ${statsFilter.brewery}`
    }
    GROUP BY style_id
    ORDER BY style_name ASC
  `

  const style = (await styleQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      style_id: string
      style_name: string
    }>
  })

  return style.rows.map(row => ({
    reviewAverage: round(row.review_average, 2),
    reviewCount: `${row.review_count}`,
    styleId: row.style_id,
    styleName: row.style_name
  }))
}
