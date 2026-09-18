import type { SelectQueryBuilder } from 'kysely'

import type { Database, KyselyDatabase } from '../database.js'
import type { Pagination } from '../pagination.js'

import type { RatingAggregateRow } from './review-stats.js'
import {
  percentileCont,
  ratingMode,
  stdDevPop,
  toReviewStats,
} from './review-stats.js'
import type { ListDirection } from '../list.js'
import type { StatsFilter } from './stats-filter.js'
import { noInfinity } from './stats-filter.js'

interface BreweryQuerySelection extends RatingAggregateRow {
  reviewed_beer_count: number
  brewery_id: string
  brewery_name: string
  brewery_country: string | null
}

type BreweryQueryBuilder = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'brewery' | 'beer' | 'beer_brewery',
  BreweryQuerySelection
>

// The filter by brewery needs a different FROM and joins, but the same
// selection. This is the shape both sources have before the selection is
// applied to them.
type BrewerySourceQuery = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'brewery' | 'beer' | 'beer_brewery',
  object
>

type BreweryStatsOrderProperty =
  'average' | 'brewery_name' | 'count' | 'std_dev'

export interface BreweryStatsOrder {
  property: BreweryStatsOrderProperty
  direction: ListDirection
}

function breweryOrderBy(
  builder: BreweryQueryBuilder,
  breweryStatsOrder: BreweryStatsOrder,
): BreweryQueryBuilder {
  switch (breweryStatsOrder.property) {
    case 'average':
      return builder
        .orderBy('review_average', breweryStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('brewery_name', 'asc')
    case 'brewery_name':
      return builder.orderBy('brewery_name', breweryStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', breweryStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('brewery_name', 'asc')
    case 'std_dev':
      return builder
        .orderBy('stddev_pop', breweryStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('review_average', 'desc')
        .orderBy('brewery_name', 'asc')
  }
}

export type BreweryStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewedBeerCount: string
  breweryId: string
  breweryName: string
  breweryCountry: string | undefined
}>

export async function getBrewery(
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  breweryStatsOrder: BreweryStatsOrder,
): Promise<BreweryStats> {
  let source: BrewerySourceQuery = db
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

  let breweryQuery = source.select(({ fn }) => [
    fn.count<number>('review.review_id').as('review_count'),
    fn.count<number>('review.beer').distinct().as('reviewed_beer_count'),
    fn.avg<number>('review.rating').as('review_average'),
    stdDevPop.as('stddev_pop'),
    percentileCont.as('percentile_cont'),
    ratingMode.as('mode'),
    'brewery.brewery_id as brewery_id',
    'brewery.name as brewery_name',
    'brewery.country as brewery_country',
  ])

  if (statsFilter.timeStart !== undefined) {
    breweryQuery = breweryQuery.where(
      'review.time',
      '>=',
      statsFilter.timeStart,
    )
  }

  if (statsFilter.timeEnd !== undefined) {
    breweryQuery = breweryQuery.where('review.time', '<=', statsFilter.timeEnd)
  }

  if (statsFilter.location !== undefined) {
    breweryQuery = breweryQuery.where(
      'review.location',
      '=',
      statsFilter.location,
    )
  }

  if (statsFilter.style !== undefined) {
    breweryQuery = breweryQuery
      .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
      .where('beer_style.style', '=', statsFilter.style)
  }

  return (
    await breweryOrderBy(
      breweryQuery
        .groupBy('brewery_id')
        .having(
          (eb) => eb.fn.avg('review.rating'),
          '<=',
          statsFilter.maxReviewAverage,
        )
        .having(
          (eb) => eb.fn.avg('review.rating'),
          '>=',
          statsFilter.minReviewAverage,
        )
        .having(
          (eb) => eb.fn.count('review.review_id'),
          '<=',
          noInfinity(statsFilter.maxReviewCount),
        )
        .having(
          (eb) => eb.fn.count('review.review_id'),
          '>=',
          noInfinity(statsFilter.minReviewCount),
        ),
      breweryStatsOrder,
    )
      .offset(pagination.skip)
      .limit(pagination.size)
      .execute()
  ).map((row) => ({
    ...toReviewStats(row),
    reviewedBeerCount: `${row.reviewed_beer_count}`,
    breweryId: row.brewery_id,
    breweryName: row.brewery_name,
    breweryCountry: row.brewery_country ?? undefined,
  }))
}
