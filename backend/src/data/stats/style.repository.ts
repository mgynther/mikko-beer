import type { SelectQueryBuilder } from 'kysely'

import type { Database, KyselyDatabase } from '../database.js'

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

interface StyleQuerySelection extends RatingAggregateRow {
  style_id: string
  style_name: string
}

type StyleQueryBuilder = SelectQueryBuilder<
  KyselyDatabase,
  'review' | 'style' | 'beer' | 'beer_style',
  StyleQuerySelection
>

type StyleStatsOrderProperty = 'average' | 'style_name' | 'count' | 'std_dev'

export interface StyleStatsOrder {
  property: StyleStatsOrderProperty
  direction: ListDirection
}

function styleOrderBy(
  builder: StyleQueryBuilder,
  styleStatsOrder: StyleStatsOrder,
): StyleQueryBuilder {
  switch (styleStatsOrder.property) {
    case 'average':
      return builder
        .orderBy('review_average', styleStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('style_name', 'asc')
    case 'style_name':
      return builder.orderBy('style_name', styleStatsOrder.direction)
    case 'count':
      return builder
        .orderBy('review_count', styleStatsOrder.direction)
        .orderBy('review_average', 'desc')
        .orderBy('style_name', 'asc')
    case 'std_dev':
      return builder
        .orderBy('stddev_pop', styleStatsOrder.direction)
        .orderBy('review_count', 'desc')
        .orderBy('review_average', 'desc')
        .orderBy('style_name', 'asc')
  }
}

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  styleId: string
  styleName: string
}>

export async function getStyle(
  db: Database,
  statsFilter: StatsFilter,
  styleStatsOrder: StyleStatsOrder,
): Promise<StyleStats> {
  let beerQuery = db
    .getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer.beer_id')

  if (statsFilter.style !== undefined) {
    beerQuery = db
      .getDb()
      .selectFrom('beer_style as querystyle')
      .where('querystyle.style', '=', statsFilter.style)
      .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
      .innerJoin('review', 'beer.beer_id', 'review.beer')
  }

  if (statsFilter.timeStart !== undefined) {
    beerQuery = beerQuery.where('review.time', '>=', statsFilter.timeStart)
  }

  if (statsFilter.timeEnd !== undefined) {
    beerQuery = beerQuery.where('review.time', '<=', statsFilter.timeEnd)
  }

  if (statsFilter.location !== undefined) {
    beerQuery = beerQuery.where('review.location', '=', statsFilter.location)
  }

  if (statsFilter.brewery !== undefined) {
    beerQuery = beerQuery
      .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
      .where('beer_brewery.brewery', '=', statsFilter.brewery)
  }
  const styleQuery = beerQuery
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')

  const statsQuery = styleQuery.select(({ fn }) => [
    fn.count<number>('review.review_id').as('review_count'),
    fn.avg<number>('review.rating').as('review_average'),
    stdDevPop.as('stddev_pop'),
    percentileCont.as('percentile_cont'),
    ratingMode.as('mode'),
    'style.style_id as style_id',
    'style.name as style_name',
  ])

  return (
    await styleOrderBy(
      statsQuery
        .groupBy('style_id')
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
      styleStatsOrder,
    ).execute()
  ).map((row) => ({
    ...toReviewStats(row),
    styleId: row.style_id,
    styleName: row.style_name,
  }))
}
