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

interface LocationQuerySelection extends RatingAggregateRow {
  location_id: string
  location_name: string
}

type LocationQueryBuilder = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'location',
  LocationQuerySelection
>

// The filter by brewery needs a different FROM and joins, but the same
// selection. This is the shape both sources have before the selection is
// applied to them.
type LocationSourceQuery = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'location' | 'beer',
  object
>

type LocationStatsOrderProperty =
  'average' | 'location_name' | 'count' | 'std_dev'

export interface LocationStatsOrder {
  property: LocationStatsOrderProperty
  direction: ListDirection
}

function locationOrderBy(
  builder: LocationQueryBuilder,
  locationStatsOrder: LocationStatsOrder,
): LocationQueryBuilder {
  switch (locationStatsOrder.property) {
    case 'average':
      return builder
        .orderBy('review_average', locationStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('location_name', 'asc')
    case 'location_name':
      return builder.orderBy('location_name', locationStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', locationStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('location_name', 'asc')
    case 'std_dev':
      return builder
        .orderBy('stddev_pop', locationStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('review_average', 'desc')
        .orderBy('location_name', 'asc')
  }
}

export type LocationStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  locationId: string
  locationName: string
}>

export async function getLocation(
  db: Database,
  pagination: Pagination,
  statsFilter: StatsFilter,
  locationStatsOrder: LocationStatsOrder,
): Promise<LocationStats> {
  let source: LocationSourceQuery = db
    .getDb()
    .selectFrom('review')
    .innerJoin('location', 'review.location', 'location.location_id')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')

  if (statsFilter.brewery !== undefined) {
    source = db
      .getDb()
      .selectFrom('beer_brewery as querybrewery')
      .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
      .innerJoin('location', 'review.location', 'location.location_id')
      .where('querybrewery.brewery', '=', statsFilter.brewery)
  }

  let locationQuery = source.select(({ fn }) => [
    fn.count<number>('review.review_id').as('review_count'),
    fn.avg<number>('review.rating').as('review_average'),
    stdDevPop.as('stddev_pop'),
    percentileCont.as('percentile_cont'),
    ratingMode.as('mode'),
    'location.location_id as location_id',
    'location.name as location_name',
  ])

  if (statsFilter.timeStart !== undefined) {
    locationQuery = locationQuery.where(
      'review.time',
      '>=',
      statsFilter.timeStart,
    )
  }

  if (statsFilter.timeEnd !== undefined) {
    locationQuery = locationQuery.where(
      'review.time',
      '<=',
      statsFilter.timeEnd,
    )
  }

  if (statsFilter.location !== undefined) {
    locationQuery = locationQuery.where(
      'review.location',
      '=',
      statsFilter.location,
    )
  }

  if (statsFilter.style !== undefined) {
    locationQuery = locationQuery
      .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
      .where('beer_style.style', '=', statsFilter.style)
  }

  return (
    await locationOrderBy(
      locationQuery
        .groupBy('location_id')
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
      locationStatsOrder,
    )
      .offset(pagination.skip)
      .limit(pagination.size)
      .execute()
  ).map((row) => ({
    ...toReviewStats(row),
    locationId: row.location_id,
    locationName: row.location_name,
  }))
}
