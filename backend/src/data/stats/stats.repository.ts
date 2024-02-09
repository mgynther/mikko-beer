import { type SelectQueryBuilder, sql } from 'kysely'

import { type Database, type KyselyDatabase } from '../database'
import { type Pagination } from '../../core/pagination'

import {
  type AnnualStats,
  type BreweryStats,
  type BreweryStatsOrder,
  type OverallStats,
  type RatingStats,
  type StatsFilter,
  type StyleStats,
  type StyleStatsOrder
} from '../../core/stats/stats'

// TODO try converting raw sql queries to Kysely for automatic types.
function round (value: number | null, decimals: number): string {
  if (value === undefined || value === null) return ''
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

interface BreweryQuerySelection {
  review_average: number
  review_count: number
  brewery_id: string
  brewery_name: string | null
}

type BreweryQueryBuilder =
  SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'brewery' | 'beer' | 'beer_brewery',
  BreweryQuerySelection
  >

function breweryOrderBy (
  builder: BreweryQueryBuilder,
  breweryStatsOrder: BreweryStatsOrder
): BreweryQueryBuilder {
  if (breweryStatsOrder.property === 'average') {
    return builder
      .orderBy('review_average', breweryStatsOrder.direction)
      .orderBy('review_count', 'desc')
      .orderBy('brewery_name', 'asc')
  }
  if (breweryStatsOrder.property === 'brewery_name') {
    return builder
      .orderBy('brewery_name', breweryStatsOrder.direction)
  }
  if (breweryStatsOrder.property === 'count') {
    return builder
      .orderBy('review_count', breweryStatsOrder.direction)
      .orderBy('review_average', 'desc')
      .orderBy('brewery_name', 'asc')
  }
  return builder
}

export async function getBrewery (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter | undefined,
  breweryStatsOrder: BreweryStatsOrder
): Promise<BreweryStats> {
  let breweryQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .select(({ fn }) => [
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      'brewery.brewery_id as brewery_id',
      'brewery.name as brewery_name'
    ])

  if (statsFilter !== undefined) {
    breweryQuery = db.getDb()
      .selectFrom('beer_brewery as querybrewery')
      .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
      .where('querybrewery.brewery', '=', statsFilter.brewery)
      .select(({ fn }) => [
        fn.count<number>('review.review_id').as('review_count'),
        fn.avg<number>('review.rating').as('review_average'),
        'brewery.brewery_id as brewery_id',
        'brewery.name as brewery_name'
      ])
  }

  return (await breweryOrderBy(
    breweryQuery
      .groupBy('brewery_id'), breweryStatsOrder
  )
    .offset(pagination.skip)
    .limit(pagination.size)
    .execute())
    .map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      breweryId: row.brewery_id,
      breweryName: row.brewery_name ?? ''
    }))
}

interface Stats {
  beer_count: number
  brewery_count: number
  container_count: number
  style_count: number
}

interface ReviewStats {
  review_count: number
  review_average: number
}

export async function getOverall (
  db: Database,
  statsFilter: StatsFilter | undefined
): Promise<OverallStats> {
  if (statsFilter === undefined) {
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
      rows: Array<Stats & ReviewStats>
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

  const statsQuery = sql`SELECT
    COUNT(DISTINCT beer.beer_id) AS beer_count,
    COUNT(DISTINCT brewery.brewery_id) AS brewery_count,
    COUNT(DISTINCT container.container_id) AS container_count,
    COUNT(DISTINCT beer_style.style) AS style_count
    FROM beer_brewery AS querybrewery
    INNER JOIN beer ON querybrewery.beer = beer.beer_id
    INNER JOIN review ON beer.beer_id = review.beer
    INNER JOIN container ON review.container = container.container_id
    INNER JOIN beer_style ON beer.beer_id = beer_style.beer
    INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
    INNER JOIN brewery ON beer_brewery.brewery = brewery.brewery_id
    WHERE querybrewery.brewery = ${statsFilter.brewery}
  `

  const averageQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(review.rating) as review_average
    FROM beer_brewery
    INNER JOIN beer ON beer_brewery.beer = beer.beer_id
    INNER JOIN review ON beer.beer_id = review.beer
    WHERE beer_brewery.brewery = ${statsFilter.brewery}
  `

  const statsPromise = (statsQuery
    .execute(db.getDb()) as Promise<{
    rows: Stats[]
  }>)

  const averageStatsPromise = (averageQuery
    .execute(db.getDb()) as Promise<{
    rows: ReviewStats[]
  }>)

  const [statsResults, averageStatsResults] =
    await Promise.all([statsPromise, averageStatsPromise])
  const stats = statsResults.rows[0]
  const averageStats = averageStatsResults.rows[0]

  return {
    beerCount: `${stats.beer_count}`,
    breweryCount: `${stats.brewery_count}`,
    containerCount: `${stats.container_count}`,
    reviewAverage: round(averageStats.review_average, 2),
    reviewCount: `${averageStats.review_count}`,
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

interface StyleQuerySelection {
  review_average: number
  review_count: number
  style_id: string
  style_name: string | null
}

type StyleQueryBuilder =
  SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'style' | 'beer' | 'beer_style',
  StyleQuerySelection
  >

function styleOrderBy (
  builder: StyleQueryBuilder,
  styleStatsOrder: StyleStatsOrder
): StyleQueryBuilder {
  if (styleStatsOrder.property === 'average') {
    return builder
      .orderBy('review_average', styleStatsOrder.direction)
      .orderBy('review_count', 'desc')
      .orderBy('style_name', 'asc')
  }
  if (styleStatsOrder.property === 'style_name') {
    return builder
      .orderBy('style_name', styleStatsOrder.direction)
  }
  if (styleStatsOrder.property === 'count') {
    return builder
      .orderBy('review_count', styleStatsOrder.direction)
      .orderBy('review_average', 'desc')
      .orderBy('style_name', 'asc')
  }
  return builder
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter | undefined,
  styleStatsOrder: StyleStatsOrder
): Promise<StyleStats> {
  let beerQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
  if (statsFilter !== undefined) {
    beerQuery = beerQuery
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .where('beer_brewery.brewery', '=', statsFilter.brewery)
  }
  const styleQuery = beerQuery
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')
    .select(({ fn }) => [
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      'style.style_id as style_id',
      'style.name as style_name'
    ])

  return (await styleOrderBy(
    styleQuery
      .groupBy('style_id'), styleStatsOrder
  )
    .execute())
    .map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      styleId: row.style_id,
      styleName: row.style_name ?? ''
    }))
}
