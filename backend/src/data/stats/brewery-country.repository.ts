import type { SelectQueryBuilder } from 'kysely'
import { sql } from 'kysely'

import type { Database, KyselyDatabase } from '../database.js'
import type { Pagination } from '../pagination.js'

import type { RatingAggregateRow } from './review-stats.js'
import { toReviewStats } from './review-stats.js'
import type { ListDirection } from '../list.js'
import type { StatsFilter } from './stats-filter.js'
import { noInfinity } from './stats-filter.js'

// A beer has many breweries, so joining review -> beer -> beer_brewery ->
// brewery and grouping by country counts a collaboration review once per
// brewery of a country rather than once per country: a beer of two Finnish
// and one Belgian brewery would give FI a review count of two and a
// double-weighted average, median, mode and standard deviation.
//
// The rating aggregates are therefore taken over distinct (country, review)
// pairs. The brewery count needs the opposite - the breweries the dedup
// throws away - so the two come from two derived tables over one filtered
// base rather than from one aggregation.

interface FilteredRow {
  country: string
  brewery_id: string
  review_id: string
  rating: number
  beer: string
}

// The filter by brewery needs a different FROM and joins, but the same
// selection. This is the shape both sources have before the selection is
// applied to them.
type FilteredSourceQuery = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'brewery' | 'beer' | 'beer_brewery',
  object
>

type FilteredQuery = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'brewery' | 'beer' | 'beer_brewery',
  FilteredRow
>

// Every review of a brewery of a country, once per brewery. Breweries
// without a country are left out.
function filteredQuery(db: Database, statsFilter: StatsFilter): FilteredQuery {
  let source: FilteredSourceQuery = db
    .getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')

  if (statsFilter.brewery !== undefined) {
    source = db
      .getDb()
      .selectFrom('beer_brewery as querybrewery')
      .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
      .where('querybrewery.brewery', '=', statsFilter.brewery)
  }

  let query = source
    .select([
      // The WHERE below rules the nulls out, which the column type of a
      // nullable country cannot express.
      sql<string>`brewery.country`.as('country'),
      'brewery.brewery_id as brewery_id',
      'review.review_id as review_id',
      'review.rating as rating',
      'review.beer as beer',
    ])
    .where('brewery.country', 'is not', null)

  if (statsFilter.timeStart !== undefined) {
    query = query.where('review.time', '>=', statsFilter.timeStart)
  }

  if (statsFilter.timeEnd !== undefined) {
    query = query.where('review.time', '<=', statsFilter.timeEnd)
  }

  if (statsFilter.location !== undefined) {
    query = query.where('review.location', '=', statsFilter.location)
  }

  if (statsFilter.style !== undefined) {
    query = query
      .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
      .where('beer_style.style', '=', statsFilter.style)
  }

  return query
}

interface BreweryCountryQuerySelection extends RatingAggregateRow {
  reviewed_beer_count: number
  brewery_count: number
  country_code: string
}

type BreweryCountryQueryBuilder = SelectQueryBuilder<
  KyselyDatabase,
  never,
  BreweryCountryQuerySelection
>

type BreweryCountryStatsOrderProperty =
  'average' | 'brewery_count' | 'count' | 'country_code' | 'std_dev'

export interface BreweryCountryStatsOrder {
  property: BreweryCountryStatsOrderProperty
  direction: ListDirection
}

function breweryCountryOrderBy(
  builder: BreweryCountryQueryBuilder,
  breweryCountryStatsOrder: BreweryCountryStatsOrder,
): BreweryCountryQueryBuilder {
  switch (breweryCountryStatsOrder.property) {
    case 'average':
      return builder
        .orderBy('review_average', breweryCountryStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('country_code', 'asc')
    case 'brewery_count':
      return builder
        .orderBy('brewery_count', breweryCountryStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('review_average', 'desc')
        .orderBy('country_code', 'asc')
    case 'country_code':
      return builder.orderBy('country_code', breweryCountryStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', breweryCountryStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('country_code', 'asc')
    case 'std_dev':
      return builder
        .orderBy('stddev_pop', breweryCountryStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('review_average', 'desc')
        .orderBy('country_code', 'asc')
  }
}

export type BreweryCountryStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewedBeerCount: string
  breweryCount: string
  countryCode: string
}>

export async function getBreweryCountry(
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryCountryStatsOrder: BreweryCountryStatsOrder,
): Promise<BreweryCountryStats> {
  const breweryCountryQuery = db
    .getDb()
    .with('filtered', () => filteredQuery(db, statsFilter))
    // One row per country and review, so a collaboration review counts
    // once into each of its countries. review_id determines rating and
    // beer, so the DISTINCT only drops the duplicate brewery rows.
    .with('country_review', (creator) =>
      creator
        .selectFrom('filtered')
        .distinct()
        .select(['country', 'review_id', 'rating', 'beer']),
    )
    // The breweries the dedup above throws away, counted before it.
    .with('country_brewery', (creator) =>
      creator
        .selectFrom('filtered')
        .select(({ fn }) => [
          'country',
          fn.count<number>('brewery_id').distinct().as('brewery_count'),
        ])
        .groupBy('country'),
    )
    .selectFrom('country_review')
    // Both sides come from filtered, so every country of one is in the
    // other and the join drops nothing.
    .innerJoin(
      'country_brewery',
      'country_review.country',
      'country_brewery.country',
    )
    .select(({ fn }) => [
      fn.count<number>('country_review.review_id').as('review_count'),
      fn
        .count<number>('country_review.beer')
        .distinct()
        .as('reviewed_beer_count'),
      fn.avg<number>('country_review.rating').as('review_average'),
      sql<number>`STDDEV_POP(country_review.rating)`.as('stddev_pop'),
      sql<number>`PERCENTILE_CONT(0.5)
        WITHIN GROUP (ORDER BY country_review.rating)`.as('percentile_cont'),
      sql<number>`MODE()
        WITHIN GROUP (ORDER BY country_review.rating ASC)`.as('mode'),
      'country_brewery.brewery_count as brewery_count',
      'country_review.country as country_code',
    ])
    .groupBy(['country_review.country', 'country_brewery.brewery_count'])
    .having(
      (eb) => eb.fn.avg('country_review.rating'),
      '<=',
      statsFilter.maxReviewAverage,
    )
    .having(
      (eb) => eb.fn.avg('country_review.rating'),
      '>=',
      statsFilter.minReviewAverage,
    )
    .having(
      (eb) => eb.fn.count('country_review.review_id'),
      '<=',
      noInfinity(statsFilter.maxReviewCount),
    )
    .having(
      (eb) => eb.fn.count('country_review.review_id'),
      '>=',
      noInfinity(statsFilter.minReviewCount),
    )

  return (
    await breweryCountryOrderBy(breweryCountryQuery, breweryCountryStatsOrder)
      .offset(pagination.skip)
      .limit(pagination.size)
      .execute()
  ).map((row) => ({
    ...toReviewStats(row),
    reviewedBeerCount: `${row.reviewed_beer_count}`,
    breweryCount: `${row.brewery_count}`,
    countryCode: row.country_code,
  }))
}
