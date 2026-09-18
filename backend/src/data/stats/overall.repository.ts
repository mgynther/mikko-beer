import type { SelectQueryBuilder } from 'kysely'
import { sql } from 'kysely'

import type { Database, KyselyDatabase } from '../database.js'

import { formatInteger } from './format.js'
import type { RatingAggregateRow } from './review-stats.js'
import {
  percentileCont,
  ratingMode,
  stdDevPop,
  toReviewStats,
} from './review-stats.js'
import type { StatsIdFilter } from './stats-filter.js'

interface Stats {
  beer_count: number
  brewery_count: number
  brewery_country_count: number
  container_count: number
  location_count: number
  style_count: number
}

interface ReviewQueryResult extends RatingAggregateRow {
  distinct_beer_review_count: number
  review_with_location_count: number
  review_without_location_count: number
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  breweryCountryCount: string
  containerCount: string
  locationCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewWithLocationCount: string
  reviewWithoutLocationCount: string
  styleCount: string
}

async function getFullOverall(db: Database): Promise<OverallStats> {
  const statsQuery = sql<Stats & ReviewQueryResult>`SELECT
    (SELECT COUNT(1) FROM beer) AS beer_count,
    (SELECT COUNT(1) FROM brewery) AS brewery_count,
    (SELECT COUNT(DISTINCT country) FROM brewery) AS brewery_country_count,
    (SELECT COUNT(1) FROM container) AS container_count,
    (SELECT COUNT(1) FROM location) AS location_count,
    (SELECT COUNT(1) FROM review) AS review_count,
    (SELECT COUNT(DISTINCT beer) FROM review) AS distinct_beer_review_count,
    (SELECT COUNT(1) FROM review WHERE location IS NOT null)
      AS review_with_location_count,
    (SELECT COUNT(1) FROM review WHERE location IS null)
      AS review_without_location_count,
    (SELECT COUNT(1) FROM style) AS style_count,
    (SELECT AVG(review.rating) FROM review) AS review_average,
    (SELECT ${stdDevPop} FROM review) AS stddev_pop,
    (SELECT ${percentileCont} FROM review) AS percentile_cont,
    (SELECT ${ratingMode} FROM review) AS mode
  `
  const stats = (await statsQuery.execute(db.getDb())).rows[0]

  return {
    beerCount: `${stats.beer_count}`,
    breweryCount: `${stats.brewery_count}`,
    breweryCountryCount: `${stats.brewery_country_count}`,
    containerCount: `${stats.container_count}`,
    locationCount: `${stats.location_count}`,
    distinctBeerReviewCount: `${stats.distinct_beer_review_count}`,
    ...toReviewStats(stats),
    reviewWithLocationCount: formatInteger(stats.review_with_location_count),
    reviewWithoutLocationCount: formatInteger(
      stats.review_without_location_count,
    ),
    styleCount: `${stats.style_count}`,
  }
}

interface ContainerIds {
  review_container: string | null
  storage_container: string | null
}

function countContainerIds(idRows: ContainerIds[]): number {
  const ids = new Set<string>()
  idRows.forEach((row) => {
    if (row.review_container !== null) {
      ids.add(row.review_container)
    }
    if (row.storage_container !== null) {
      ids.add(row.storage_container)
    }
  })
  return ids.size
}

interface BeerStatsQueryResult {
  beer_count: number
  brewery_count: number
  brewery_country_count: number
  style_count: number
}

interface EntityReviewQueryResult extends ReviewQueryResult {
  location_count: number
}

// A brewery's and a style's overall stats select the same review
// aggregates; only the FROM and its join to review differ, so the caller
// passes the source it has already filtered.
type EntityReviewSource = SelectQueryBuilder<KyselyDatabase, 'review', object>

async function getEntityReviewStats(
  source: EntityReviewSource,
): Promise<EntityReviewQueryResult> {
  return await source
    .select(({ fn }) => [
      fn.count<number>('review.location').distinct().as('location_count'),
      fn.count<number>('review.review_id').as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      sql<number>`COUNT(CASE WHEN review.location IS NOT NULL THEN 1 END)`.as(
        'review_with_location_count',
      ),
      sql<number>`COUNT(CASE WHEN review.location IS NULL THEN 1 END)`.as(
        'review_without_location_count',
      ),
      stdDevPop.as('stddev_pop'),
      percentileCont.as('percentile_cont'),
      ratingMode.as('mode'),
      fn
        .count<number>('review.beer')
        .distinct()
        .as('distinct_beer_review_count'),
    ])
    .executeTakeFirstOrThrow()
}

// The brewery and the style variants build the same result from their
// three queries. The location variant does not: it knows its location
// count is one and that every review it counted has a location.
function toEntityOverallStats(
  beerStats: BeerStatsQueryResult,
  reviewStats: EntityReviewQueryResult,
  containerCount: number,
): OverallStats {
  return {
    beerCount: `${beerStats.beer_count}`,
    breweryCount: `${beerStats.brewery_count}`,
    breweryCountryCount: `${beerStats.brewery_country_count}`,
    containerCount: `${containerCount}`,
    locationCount: `${reviewStats.location_count}`,
    distinctBeerReviewCount: `${reviewStats.distinct_beer_review_count}`,
    ...toReviewStats(reviewStats),
    reviewWithLocationCount: formatInteger(
      reviewStats.review_with_location_count,
    ),
    reviewWithoutLocationCount: formatInteger(
      reviewStats.review_without_location_count,
    ),
    styleCount: `${beerStats.style_count}`,
  }
}

async function getBreweryOverall(
  db: Database,
  brewery: string,
): Promise<OverallStats> {
  const beerQuery = db.getDb().selectFrom('beer_brewery as querybrewery')

  const beerStatsQuery = beerQuery
    .innerJoin('beer_style', 'querybrewery.beer', 'beer_style.beer')
    .innerJoin('beer_brewery', 'querybrewery.beer', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .select(({ fn }) => [
      fn.count<number>('querybrewery.beer').distinct().as('beer_count'),
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn
        .count<number>('brewery.country')
        .distinct()
        .as('brewery_country_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count'),
    ])
    .where('querybrewery.brewery', '=', brewery)

  const containerQuery = beerQuery
    .leftJoin('review', 'querybrewery.beer', 'review.beer')
    .leftJoin('storage', 'querybrewery.beer', 'storage.beer')
    .select([
      'review.container as review_container',
      'storage.container as storage_container',
    ])
    .where('querybrewery.brewery', '=', brewery)

  const reviewStatsPromise = getEntityReviewStats(
    db
      .getDb()
      .selectFrom('beer_brewery')
      .innerJoin('review', 'beer_brewery.beer', 'review.beer')
      .where('beer_brewery.brewery', '=', brewery),
  )

  const [beerStatsResults, containerResults, reviewStats] = await Promise.all([
    beerStatsQuery.executeTakeFirstOrThrow(),
    containerQuery.execute(),
    reviewStatsPromise,
  ])
  const containerCount = countContainerIds(containerResults)

  return toEntityOverallStats(beerStatsResults, reviewStats, containerCount)
}

async function getLocationOverall(
  db: Database,
  location: string,
): Promise<OverallStats> {
  const beerQuery = db
    .getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .select(({ fn }) => [
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn
        .count<number>('brewery.country')
        .distinct()
        .as('brewery_country_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count'),
    ])
    .where('review.location', '=', location)

  const reviewQuery = db
    .getDb()
    .selectFrom('review')
    .select(({ fn }) => [
      fn.count<number>('review.beer').distinct().as('beer_count'),
      fn.count<number>('review.container').distinct().as('container_count'),
      fn.count<number>('review.review_id').distinct().as('review_count'),
      fn.avg<number>('review.rating').as('review_average'),
      stdDevPop.as('stddev_pop'),
      percentileCont.as('percentile_cont'),
      ratingMode.as('mode'),
    ])
    .where('review.location', '=', location)

  const [beerStats, reviewStats] = await Promise.all([
    beerQuery.executeTakeFirstOrThrow(),
    reviewQuery.executeTakeFirstOrThrow(),
  ])

  return {
    beerCount: `${reviewStats.beer_count}`,
    breweryCount: `${beerStats.brewery_count}`,
    breweryCountryCount: `${beerStats.brewery_country_count}`,
    containerCount: `${reviewStats.container_count}`,
    locationCount: '1',
    distinctBeerReviewCount: `${reviewStats.beer_count}`,
    ...toReviewStats(reviewStats),
    reviewWithLocationCount: `${reviewStats.review_count}`,
    reviewWithoutLocationCount: formatInteger(0),
    styleCount: `${beerStats.style_count}`,
  }
}

async function getStyleOverall(
  db: Database,
  style: string,
): Promise<OverallStats> {
  const beerQuery = db.getDb().selectFrom('beer_style as querystyle')

  const beerStatsQuery = beerQuery
    .innerJoin('beer_style', 'querystyle.beer', 'beer_style.beer')
    .innerJoin('beer_brewery', 'querystyle.beer', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .select(({ fn }) => [
      fn.count<number>('querystyle.beer').distinct().as('beer_count'),
      fn.count<number>('beer_brewery.brewery').distinct().as('brewery_count'),
      fn
        .count<number>('brewery.country')
        .distinct()
        .as('brewery_country_count'),
      fn.count<number>('beer_style.style').distinct().as('style_count'),
    ])
    .where('querystyle.style', '=', style)

  const containerQuery = beerQuery
    .leftJoin('review', 'querystyle.beer', 'review.beer')
    .leftJoin('storage', 'querystyle.beer', 'storage.beer')
    .select([
      'review.container as review_container',
      'storage.container as storage_container',
    ])
    .where('querystyle.style', '=', style)

  const reviewStatsPromise = getEntityReviewStats(
    db
      .getDb()
      .selectFrom('beer_style')
      .innerJoin('review', 'beer_style.beer', 'review.beer')
      .where('beer_style.style', '=', style),
  )

  const [beerStatsResults, containerResults, reviewStats] = await Promise.all([
    beerStatsQuery.executeTakeFirstOrThrow(),
    containerQuery.execute(),
    reviewStatsPromise,
  ])
  const containerCount = countContainerIds(containerResults)

  return toEntityOverallStats(beerStatsResults, reviewStats, containerCount)
}

export async function getOverall(
  db: Database,
  statsFilter: StatsIdFilter,
): Promise<OverallStats> {
  const { brewery, location, style } = statsFilter
  if ([brewery, location, style].filter((id) => id !== undefined).length > 1) {
    throw new Error(
      'Multiple filters of brewery, location and style not supported',
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
