import { sql } from 'kysely'

import { type Database } from '../database'
import { type Stats } from './stats'

export async function getStats (
  db: Database
): Promise<Stats> {
  // TODO try converting raw sql queries to Kysely for automatic types.
  const statsQuery = sql`SELECT
    (SELECT COUNT(1) FROM beer) AS beer_count,
    (SELECT COUNT(1) FROM container) AS container_count,
    (SELECT COUNT(1) FROM review) AS review_count,
    (SELECT COUNT(1) FROM style) AS style_count,
    (SELECT AVG(rating) FROM review) AS review_average
  `
  const annualQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    DATE_PART('YEAR', time) as year FROM review as year
    GROUP BY year
    ORDER BY year ASC
  `

  const styleQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    style.style_id as style_id,
    style.name as style_name
    FROM review
    INNER JOIN beer ON review.beer = beer.beer_id
    INNER JOIN beer_style ON beer.beer_id = beer_style.beer
    INNER JOIN style ON beer_style.style = style.style_id
    GROUP BY style.style_id
    ORDER BY style.name ASC
  `

  const annual = (await annualQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      year: number
    }>
  })

  const style = (await styleQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      style_id: string
      style_name: string
    }>
  })

  const stats = (await statsQuery
    .execute(db.getDb()) as {
    rows: Array<{
      beer_count: number
      container_count: number
      review_count: number
      review_average: number
      style_count: number
    }>
  }).rows[0]

  function round (value: number, decimals: number): string {
    return Number(
      `${Math.round(parseFloat(`${value}e${decimals}`))}e-${decimals}`
    ).toFixed(decimals)
  }

  return {
    beerCount: `${stats.beer_count}`,
    containerCount: `${stats.container_count}`,
    reviewAverage: round(stats.review_average, 2),
    reviewCount: `${stats.review_count}`,
    styleCount: `${stats.style_count}`,
    annual: annual.rows.map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      year: `${row.year}`
    })),
    styles: style.rows.map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      styleId: row.style_id,
      styleName: row.style_name
    }))
  }
}
