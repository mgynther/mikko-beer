import type { SelectQueryBuilder, RawBuilder } from 'kysely'
import { sql } from 'kysely'

import type { Database, KyselyDatabase } from '../database'
import type { Pagination } from '../../core/pagination'

import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  LocationStats,
  LocationStatsOrder,
  OverallStats,
  RatingStats,
  StatsIdFilter,
  StatsFilter,
  StyleStats,
  StyleStatsOrder
} from '../../core/stats/stats'
import { contains } from '../../core/record'

// TODO try converting raw sql queries to Kysely for automatic types.
function round (value: number | null | undefined, decimals: number): string {
  if (value === undefined || value === null) return ''
  return Number(
    `${Math.round(parseFloat(`${value}e${decimals}`))}e-${decimals}`
  ).toFixed(decimals)
}

function noInfinity (value: number): number {
  if (value > 0 && !Number.isFinite(value)) {
    return 10000000
  }
  return value
}

function idFilter (
  statsFilter: StatsIdFilter
): RawBuilder<unknown> {
  const locationAndFilter = statsFilter.location === undefined
    ? sql``
    : sql`AND review.location = ${statsFilter.location}`
  const locationWhereFilter = statsFilter.location === undefined
    ? sql``
    : sql`WHERE review.location = ${statsFilter.location}`
  if (statsFilter.brewery !== undefined && statsFilter.style !== undefined) {
    return sql`
      INNER JOIN beer ON review.beer = beer.beer_id
      INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
      INNER JOIN beer_style ON beer.beer_id = beer_style.beer
      WHERE beer_brewery.brewery = ${statsFilter.brewery}
      ${locationAndFilter}
      AND beer_style.style = ${statsFilter.style}
      `
  }
  if (statsFilter.brewery !== undefined) {
    return sql`
      INNER JOIN beer ON review.beer = beer.beer_id
      INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
      WHERE beer_brewery.brewery = ${statsFilter.brewery}
      ${locationAndFilter}
      `
  }
  if (statsFilter.style !== undefined) {
    return sql`
      INNER JOIN beer ON review.beer = beer.beer_id
      INNER JOIN beer_style ON beer.beer_id = beer_style.beer
      WHERE beer_style.style = ${statsFilter.style}
      ${locationAndFilter}
      `
  }
  return locationWhereFilter
}

export async function getAnnual (
  db: Database,
  statsFilter: StatsIdFilter
): Promise<AnnualStats> {
  const annualQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(rating) as review_average,
    DATE_PART('YEAR', time) as year FROM review
    ${idFilter(statsFilter)}
    GROUP BY year
    ORDER BY year ASC
  `

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Tightly coupled with the string query.
   */
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

export async function getAnnualContainer (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsIdFilter
) : Promise<AnnualContainerStats> {
  const annualContainerQuery = sql`SELECT
    COUNT(1) AS review_count,
    AVG(review.rating) as review_average,
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

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Tightly coupled with the string query.
   */
  const annualContainer = (await annualContainerQuery
    .execute(db.getDb()) as {
    rows: Array<{
      container_id: string
      container_type: string
      container_size: string
      review_average: number
      review_count: number
      year: number
    }>
  })

  return annualContainer.rows.map(row => ({
    containerId: row.container_id,
    containerSize: row.container_size,
    containerType: row.container_type,
    reviewAverage: round(row.review_average, 2),
    reviewCount: `${row.review_count}`,
    year: `${row.year}`
  }))
}

export async function getContainer (
  db: Database,
  statsFilter: StatsIdFilter
): Promise<ContainerStats> {
  const containerQuery = sql`SELECT
    COUNT(1) as review_count,
    AVG(review.rating) as review_average,
    review.container as container_id,
    container.size as container_size,
    container.type as container_type FROM review
    INNER JOIN container ON review.container = container.container_id
    ${idFilter(statsFilter)}
    GROUP BY review.container, container_size, container_type
    ORDER BY container_type ASC,
    container_size ASC
  `

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Tightly coupled with the string query.
   */
  const container = (await containerQuery
    .execute(db.getDb()) as {
    rows: Array<{
      review_average: number
      review_count: number
      container_id: string
      container_size: string
      container_type: string
    }>
  })

  return container.rows.map(row => ({
    reviewAverage: round(row.review_average, 2),
    reviewCount: `${row.review_count}`,
    containerId: row.container_id,
    containerSize: row.container_size,
    containerType: row.container_type
  }))
}

interface LocationQuerySelection {
  review_average: number
  review_count: number
  location_id: string
  location_name: string | null
}

type LocationQueryBuilder =
  SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'location',
  LocationQuerySelection
  >

function locationOrderBy (
  builder: LocationQueryBuilder,
  locationStatsOrder: LocationStatsOrder
): LocationQueryBuilder {
  switch (locationStatsOrder.property) {
    case 'average': return builder
      .orderBy('review_average', locationStatsOrder.direction)
      .orderBy('review_count', 'desc')
      .orderBy('location_name', 'asc')
    case 'location_name':
      return builder
        .orderBy('location_name', locationStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', locationStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('location_name', 'asc')
  }
}

export async function getLocation (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  locationStatsOrder: LocationStatsOrder
): Promise<LocationStats> {
  let tempQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('location', 'review.location', 'location.location_id')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')

  if (statsFilter.location !== undefined) {
    tempQuery = tempQuery.where('review.location', '=', statsFilter.location)
  }

  if (statsFilter.style !== undefined) {
    tempQuery = tempQuery
      .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
      .where('beer_style.style', '=', statsFilter.style)
  }

  let locationQuery = tempQuery.select(({ fn }) => [
    fn.count<number>('review.review_id').as('review_count'),
    fn.avg<number>('review.rating').as('review_average'),
    'location.location_id as location_id',
    'location.name as location_name'
  ])

  if (statsFilter.brewery !== undefined) {
    let query = db.getDb()
      .selectFrom('beer_brewery as querybrewery')
      .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
      .innerJoin('location', 'review.location', 'location.location_id')

    if (statsFilter.location !== undefined) {
      query = query.where('review.location', '=', statsFilter.location)
    }

    if (statsFilter.style !== undefined) {
      query = query
        .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
        .where('beer_style.style', '=', statsFilter.style)
    }

    locationQuery = query
      .where('querybrewery.brewery', '=', statsFilter.brewery)
      .select(({ fn }) => [
        fn.count<number>('review.review_id').as('review_count'),
        fn.avg<number>('review.rating').as('review_average'),
        'location.location_id as location_id',
        'location.name as location_name'
      ])
  }

  return (await locationOrderBy(
    locationQuery
      .groupBy('location_id')
      .having((eb) => eb.fn.avg(
        'review.rating'), '<=', statsFilter.maxReviewAverage
      )
      .having((eb) => eb.fn.avg(
        'review.rating'), '>=', statsFilter.minReviewAverage
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '<=', noInfinity(statsFilter.maxReviewCount)
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '>=', noInfinity(statsFilter.minReviewCount)
      )
    , locationStatsOrder
  )
    .offset(pagination.skip)
    .limit(pagination.size)
    .execute())
    .map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      locationId: row.location_id,
      locationName: row.location_name ?? ''
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
  switch (breweryStatsOrder.property) {
    case 'average': return builder
      .orderBy('review_average', breweryStatsOrder.direction)
      .orderBy('review_count', 'desc')
      .orderBy('brewery_name', 'asc')
    case 'brewery_name':
      return builder
        .orderBy('brewery_name', breweryStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', breweryStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('brewery_name', 'asc')
  }
}

export async function getBrewery (
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryStatsOrder: BreweryStatsOrder
): Promise<BreweryStats> {
  let tempQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')

  if (statsFilter.location !== undefined) {
    tempQuery = tempQuery
      .where('review.location', '=', statsFilter.location)
  }

  if (statsFilter.style !== undefined) {
    tempQuery = tempQuery
      .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
      .where('beer_style.style', '=', statsFilter.style)
  }

  let breweryQuery = tempQuery.select(({ fn }) => [
    fn.count<number>('review.review_id').as('review_count'),
    fn.avg<number>('review.rating').as('review_average'),
    'brewery.brewery_id as brewery_id',
    'brewery.name as brewery_name'
  ])

  if (statsFilter.brewery !== undefined) {
    let query = db.getDb()
      .selectFrom('beer_brewery as querybrewery')
      .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')

    if (statsFilter.location !== undefined) {
      query = query
        .where('review.location', '=', statsFilter.location)
    }

    if (statsFilter.style !== undefined) {
      query = query
        .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
        .where('beer_style.style', '=', statsFilter.style)
    }

    breweryQuery = query
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
      .groupBy('brewery_id')
      .having((eb) => eb.fn.avg(
        'review.rating'), '<=', statsFilter.maxReviewAverage
      )
      .having((eb) => eb.fn.avg(
        'review.rating'), '>=', statsFilter.minReviewAverage
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '<=', noInfinity(statsFilter.maxReviewCount)
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '>=', noInfinity(statsFilter.minReviewCount)
      )
    , breweryStatsOrder
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
  location_count: number
  style_count: number
}

interface ReviewStats {
  distinct_beer_review_count: number
  review_count: number
  review_average: number
}

async function getFullOverall (
  db: Database
): Promise<OverallStats> {
  const statsQuery = sql`SELECT
    (SELECT COUNT(1) FROM beer) AS beer_count,
    (SELECT COUNT(1) FROM brewery) AS brewery_count,
    (SELECT COUNT(1) FROM container) AS container_count,
    (SELECT COUNT(1) FROM location) AS location_count,
    (SELECT COUNT(1) FROM review) AS review_count,
    (SELECT COUNT(DISTINCT beer) FROM review) AS distinct_beer_review_count,
    (SELECT COUNT(1) FROM style) AS style_count,
    (SELECT AVG(rating) FROM review) AS review_average
  `
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Tightly coupled with the string query.
   */
  const stats = (await statsQuery
    .execute(db.getDb()) as {
    rows: Array<Stats & ReviewStats>
  }).rows[0]

  return {
    beerCount: `${stats.beer_count}`,
    breweryCount: `${stats.brewery_count}`,
    containerCount: `${stats.container_count}`,
    locationCount: `${stats.location_count}`,
    distinctBeerReviewCount: `${stats.distinct_beer_review_count}`,
    reviewAverage: round(stats.review_average, 2),
    reviewCount: `${stats.review_count}`,
    styleCount: `${stats.style_count}`
  }
}

interface ContainerIds {
  review_container: string | null
  storage_container: string | null
}

function countContainerIds (idRows: ContainerIds[]): number {
  const containers = idRows.reduce<Record<string, boolean>>((map, row) => {
    function add (value: string | null): void {
      if (value !== null && !contains(map, value)) {
        map[value] = true
      }
    }
    add(row.review_container)
    add(row.storage_container)
    return map
  }, {})

  return Object.keys(containers).length
}

async function getBreweryOverall (
  db: Database,
  brewery: string
): Promise<OverallStats> {
  const beerQuery = db.getDb()
    .selectFrom('beer_brewery as querybrewery')

  const beerStatsQuery = beerQuery
    .innerJoin('beer_style', 'querybrewery.beer', 'beer_style.beer')
    .innerJoin('beer_brewery', 'querybrewery.beer', 'beer_brewery.beer')
    .select(({ fn }) => [
      fn.count<number>('querybrewery.beer').distinct().as('beer_count'),
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count')
    ])
    .where('querybrewery.brewery', '=', brewery)

  const containerQuery = beerQuery
    .leftJoin('review', 'querybrewery.beer', 'review.beer')
    .leftJoin('storage', 'querybrewery.beer', 'storage.beer')
    .select([
      'review.container as review_container',
      'storage.container as storage_container'
    ])
    .where('querybrewery.brewery', '=', brewery)

  const reviewQuery = db.getDb()
    .selectFrom('beer_brewery')
    .innerJoin('review', 'beer_brewery.beer', 'review.beer')
    .select(({ fn }) => [
      fn.count<number>('review.location').distinct().as('location_count'),
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      fn.count<number>('review.beer')
        .distinct().as('distinct_beer_review_count')
    ])
    .where('beer_brewery.brewery', '=', brewery)

  const [beerStatsResults, containerResults, reviewStats] =
    await Promise.all([
      beerStatsQuery.execute(),
      containerQuery.execute(),
      reviewQuery.execute()
    ])
  const containerCount = countContainerIds(containerResults)

  return {
    beerCount: `${beerStatsResults[0].beer_count}`,
    breweryCount: `${beerStatsResults[0].brewery_count}`,
    containerCount: `${containerCount}`,
    locationCount: `${reviewStats[0].location_count}`,
    distinctBeerReviewCount: `${reviewStats[0].distinct_beer_review_count}`,
    reviewAverage: round(reviewStats[0].review_average, 2),
    reviewCount: `${reviewStats[0].review_count}`,
    styleCount: `${beerStatsResults[0].style_count}`
  }
}

async function getLocationOverall (
  db: Database,
  location: string
): Promise<OverallStats> {
  const beerQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .select(({ fn }) => [
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count'),
    ])
    .where('review.location', '=', location)

  const reviewQuery = db.getDb()
    .selectFrom('review')
    .select(({ fn }) => [
      fn.count<number>('review.beer').distinct().as('beer_count'),
      fn.count<number>('review.container').distinct().as('container_count'),
      fn.count<number>('review.review_id').distinct().as('review_count'),
      fn.avg<number>('review.rating').as('review_average')
    ])
    .where('review.location', '=', location)

  const [beerStats, reviewStats ] =
    await Promise.all([
      beerQuery.executeTakeFirstOrThrow(),
      reviewQuery.executeTakeFirstOrThrow()
    ])

  return {
    beerCount: `${reviewStats.beer_count}`,
    breweryCount: `${beerStats.brewery_count}`,
    containerCount: `${reviewStats.container_count}`,
    locationCount: '1',
    distinctBeerReviewCount: `${reviewStats.beer_count}`,
    reviewAverage: round(reviewStats.review_average, 2),
    reviewCount: `${reviewStats.review_count}`,
    styleCount: `${beerStats.style_count}`
  }
}

async function getStyleOverall (
  db: Database,
  style: string
): Promise<OverallStats> {
  const beerQuery = db.getDb()
    .selectFrom('beer_style as querystyle')

  const beerStatsQuery = beerQuery
    .innerJoin('beer_style', 'querystyle.beer', 'beer_style.beer')
    .innerJoin('beer_brewery', 'querystyle.beer', 'beer_brewery.beer')
    .select(({ fn }) => [
      fn.count<number>('querystyle.beer').distinct().as('beer_count'),
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count')
    ])
    .where('querystyle.style', '=', style)

  const containerQuery = beerQuery
    .leftJoin('review', 'querystyle.beer', 'review.beer')
    .leftJoin('storage', 'querystyle.beer', 'storage.beer')
    .select([
      'review.container as review_container',
      'storage.container as storage_container'
    ])
    .where('querystyle.style', '=', style)

  const reviewQuery = db.getDb()
    .selectFrom('beer_style')
    .innerJoin('review', 'beer_style.beer', 'review.beer')
    .select(({ fn }) => [
      fn.count<number>('review.location').distinct().as('location_count'),
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      fn.count<number>('review.beer')
        .distinct().as('distinct_beer_review_count')
    ])
    .where('beer_style.style', '=', style)

  const [beerStatsResults, containerResults, reviewStats] =
    await Promise.all([
      beerStatsQuery.execute(),
      containerQuery.execute(),
      reviewQuery.execute()
    ])
  const containerCount = countContainerIds(containerResults)

  return {
    beerCount: `${beerStatsResults[0].beer_count}`,
    breweryCount: `${beerStatsResults[0].brewery_count}`,
    containerCount: `${containerCount}`,
    locationCount: `${reviewStats[0].location_count}`,
    distinctBeerReviewCount: `${reviewStats[0].distinct_beer_review_count}`,
    reviewAverage: round(reviewStats[0].review_average, 2),
    reviewCount: `${reviewStats[0].review_count}`,
    styleCount: `${beerStatsResults[0].style_count}`
  }
}

export async function getOverall (
  db: Database,
  statsFilter: StatsIdFilter
): Promise<OverallStats> {
  const { brewery, location, style } = statsFilter
  if ([ brewery, location, style ].filter(id => id !== undefined).length > 1) {
    throw new Error(
      'Multiple filters of brewery, location and style not supported'
    )
  }
  if (statsFilter.brewery !== undefined) {
    return await getBreweryOverall(db, statsFilter.brewery)
  }
  if (statsFilter.location !== undefined) {
    return await getLocationOverall(db, statsFilter.location)
  }
  if (statsFilter.style !== undefined) {
    return await getStyleOverall(db, statsFilter.style)
  }
  return await getFullOverall(db)
}

export async function getRating (
  db: Database,
  statsFilter: StatsIdFilter
): Promise<RatingStats> {
  const styleQuery = sql`SELECT
    review.rating as rating,
    COUNT(1) as count
    FROM review ${idFilter(statsFilter)}
    GROUP BY review.rating
    ORDER BY review.rating ASC
  `

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Tightly coupled with the string query.
   */
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
  switch (styleStatsOrder.property) {
    case 'average': return builder
      .orderBy('review_average', styleStatsOrder.direction)
      .orderBy('review_count', 'desc')
      .orderBy('style_name', 'asc')
    case 'style_name': return builder
      .orderBy('style_name', styleStatsOrder.direction)
    case 'count': return builder
      .orderBy('review_count', styleStatsOrder.direction)
      .orderBy('review_average', 'desc')
      .orderBy('style_name', 'asc')
  }
}

export async function getStyle (
  db: Database,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder
): Promise<StyleStats> {
  let beerQuery = db.getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')

  if (statsFilter.location !== undefined) {
    beerQuery = beerQuery
      .where('review.location', '=', statsFilter.location)
  }

  if (statsFilter.style !== undefined) {
    beerQuery = db.getDb()
      .selectFrom('beer_style as querystyle')
      .where('querystyle.style', '=', statsFilter.style)
      .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
  }
  if (statsFilter.brewery !== undefined) {
    beerQuery = beerQuery
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .where('beer_brewery.brewery', '=', statsFilter.brewery)
  }
  const styleQuery = beerQuery
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')

  const statsQuery = styleQuery
    .select(({ fn }) => [
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      'style.style_id as style_id',
      'style.name as style_name'
    ])

  return (await styleOrderBy(
    statsQuery
      .groupBy('style_id')
      .having((eb) => eb.fn.avg(
        'review.rating'), '<=', statsFilter.maxReviewAverage
      )
      .having((eb) => eb.fn.avg(
        'review.rating'), '>=', statsFilter.minReviewAverage
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '<=', noInfinity(statsFilter.maxReviewCount)
      )
      .having((eb) => eb.fn.count(
        'review.review_id'), '>=', noInfinity(statsFilter.minReviewCount)
      )
    , styleStatsOrder
  )
    .execute())
    .map(row => ({
      reviewAverage: round(row.review_average, 2),
      reviewCount: `${row.review_count}`,
      styleId: row.style_id,
      styleName: row.style_name ?? ''
    }))
}
