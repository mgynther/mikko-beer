import { type SelectQueryBuilder, sql } from 'kysely'

import {
  type Database,
  type KyselyDatabase,
  type Transaction
} from '../database'
import {
  type DbJoinedReview,
  type ReviewRow,
  type ReviewTable,
  type InsertableReviewRow,
  type UpdateableReviewRow
} from './review.table'

import { type ListDirection } from '../../core/list'
import { type Pagination, toRowNumbers } from '../../core/pagination'
import { type ReviewListOrder } from '../../core/review/review'

export async function insertReview (
  trx: Transaction,
  review: InsertableReviewRow
): Promise<ReviewRow> {
  const insertedReview = await trx.trx()
    .insertInto('review')
    .values(review)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedReview
}

export async function updateReview (
  trx: Transaction,
  id: string,
  review: UpdateableReviewRow
): Promise<ReviewRow> {
  const updatedReview = await trx.trx()
    .updateTable('review')
    .set({
      additional_info: review.additional_info,
      beer: review.beer,
      container: review.container,
      location: review.location,
      rating: review.rating,
      smell: review.smell,
      taste: review.taste,
      time: review.time
    })
    .where('review_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedReview
}

export async function findReviewById (
  db: Database,
  id: string
): Promise<ReviewRow | undefined> {
  const reviewRow = await db.getDb()
    .selectFrom('review')
    .where('review_id', '=', id)
    .selectAll('review')
    .executeTakeFirstOrThrow()

  if (reviewRow === undefined) {
    return undefined
  }

  return reviewRow
}

export async function lockReviewById (
  trx: Transaction,
  id: string
): Promise<ReviewRow | undefined> {
  return await lockReview(trx, 'review_id', id)
}

async function lockReview (
  trx: Transaction,
  column: 'review_id',
  value: string
): Promise<ReviewRow | undefined> {
  const review = await trx.trx()
    .selectFrom('review')
    .where(column, '=', value)
    .selectAll('review')
    .forUpdate()
    .executeTakeFirst()

  return review
}

interface ReviewTableRn extends ReviewTable {
  rn: number
}

const listByRatingAsc =
  sql<ReviewTableRn>`(
    SELECT
      review.*,
      ROW_NUMBER() OVER(ORDER BY review.rating ASC, review.time DESC) rn
    FROM review
  )`

const listByRatingDesc =
  sql<ReviewTableRn>`(
    SELECT
      review.*,
      ROW_NUMBER() OVER(ORDER BY review.rating DESC, review.time DESC) rn
    FROM review
  )`

function getListQueryByRating (
  direction: ListDirection
): typeof listByRatingAsc {
  if (direction === 'asc') {
    return listByRatingAsc
  }
  return listByRatingDesc
}

const listByTimeAsc = sql<ReviewTableRn>`(
  SELECT
    review.*,
    ROW_NUMBER() OVER(ORDER BY review.time ASC) rn
  FROM review
  )`

const listByTimeDesc = sql<ReviewTableRn>`(
  SELECT
    review.*,
    ROW_NUMBER() OVER(ORDER BY review.time DESC) rn
  FROM review
  )`

function getListQueryByTime (
  direction: ListDirection
): typeof listByRatingAsc {
  if (direction === 'asc') {
    return listByTimeAsc
  }
  return listByTimeDesc
}

type ListQueryBuilder =
  SelectQueryBuilder<KyselyDatabase, 'review', JoinedReview>

interface ListQueryHelper {
  selectQuery: typeof listByRatingAsc
  orderBy: (query: ListQueryBuilder) => ListQueryBuilder
}

function getListQueryHelper (
  reviewListOrder: ReviewListOrder
): ListQueryHelper {
  if (reviewListOrder.property === 'rating') {
    const orderByRating = (query: ListQueryBuilder): ListQueryBuilder => {
      return query
        .orderBy('review.rating', reviewListOrder.direction)
        .orderBy('review.time', 'desc')
    }
    return {
      selectQuery: getListQueryByRating(reviewListOrder.direction),
      orderBy: orderByRating
    }
  }
  const orderByTime = (query: ListQueryBuilder): ListQueryBuilder =>
    query.orderBy('review.time', reviewListOrder.direction)
  return {
    selectQuery: getListQueryByTime(reviewListOrder.direction),
    orderBy: orderByTime
  }
}

type ListPossibleColumns =
  'review.review_id' |
  'review.additional_info' |
  'review.location' |
  'review.rating' |
  'review.time' |
  'review.created_at' |
  'beer.beer_id as beer_id' |
  'beer.name as beer_name' |
  'brewery.brewery_id as brewery_id' |
  'brewery.name as brewery_name' |
  'style.style_id as style_id' |
  'style.name as style_name' |
  'container.container_id as container_id' |
  'container.type as container_type' |
  'container.size as container_size'

const listColumns: ListPossibleColumns[] = [
  'review.review_id',
  'review.additional_info',
  'review.location',
  'review.rating',
  'review.time',
  'review.created_at',
  'beer.beer_id as beer_id',
  'beer.name as beer_name',
  'brewery.brewery_id as brewery_id',
  'brewery.name as brewery_name',
  'style.style_id as style_id',
  'style.name as style_name',
  'container.container_id as container_id',
  'container.type as container_type',
  'container.size as container_size'
]

export async function listReviews (
  db: Database,
  pagination: Pagination,
  reviewListOrder: ReviewListOrder
): Promise<DbJoinedReview[]> {
  const { start, end } = toRowNumbers(pagination)

  const queryHelper = getListQueryHelper(reviewListOrder)

  const query = db.getDb()
    .selectFrom(queryHelper.selectQuery.as('review'))
    .innerJoin('beer', 'review.beer', 'beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .innerJoin('container', 'review.container', 'container.container_id')
    .select(listColumns)
    .where((eb) => eb.between('rn', start, end))

  const reviews = await queryHelper.orderBy(query)
    .execute()

  if (reviews.length === 0) {
    return []
  }

  return parseBreweryReviewRows(reviews)
}

export async function listReviewsByBeer (
  db: Database,
  beerId: string
): Promise<DbJoinedReview[]> {
  return await joinReviewData(db.getDb()
    .selectFrom('beer')
    .where('beer.beer_id', '=', beerId)
  )
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string
): Promise<DbJoinedReview[]> {
  return await joinReviewData(db.getDb()
    .selectFrom('beer_brewery as querybrewery')
    .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
    .where('querybrewery.brewery', '=', breweryId)
  )
}

export async function joinReviewData (
  query: SelectQueryBuilder<KyselyDatabase, 'beer', unknown>
): Promise<DbJoinedReview[]> {
  const reviews = await query
    .innerJoin('review', 'beer.beer_id', 'review.beer')
    .innerJoin('beer_brewery', 'beer_brewery.beer', 'beer.beer_id')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('container', 'container.container_id', 'review.container')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .select(listColumns)
    .orderBy('beer_name')
    .orderBy('time', 'asc')
    .execute()

  if (reviews.length === 0) {
    return []
  }
  return parseBreweryReviewRows(reviews)
}

interface JoinedReview {
  review_id: string
  additional_info: string | null
  beer_id: string
  beer_name: string | null
  brewery_id: string
  brewery_name: string | null
  container_id: string
  container_size: string | null
  container_type: string | null
  location: string | null
  rating: number | null
  time: Date
  created_at: Date
  style_id: string
  style_name: string | null
}

function parseBreweryReviewRows (
  reviews: JoinedReview[]
): DbJoinedReview[] {
  const reviewMap: Record<string, DbJoinedReview> = {}
  const reviewArray: DbJoinedReview[] = []

  reviews.forEach(review => {
    if (reviewMap[review.review_id] === undefined) {
      reviewMap[review.review_id] = {
        ...review,
        breweries: [{
          brewery_id: review.brewery_id,
          name: review.brewery_name
        }],
        styles: [{
          style_id: review.style_id,
          name: review.style_name
        }]
      }
      reviewArray.push(reviewMap[review.review_id])
    } else {
      const existing = reviewMap[review.review_id]
      if (existing.breweries.find(
        brewery => brewery.brewery_id === review.brewery_id) === undefined) {
        existing.breweries.push({
          brewery_id: review.brewery_id,
          name: review.brewery_name
        })
      }
      if (existing.styles.find(
        styles => styles.style_id === review.style_id) === undefined) {
        existing.styles.push({
          style_id: review.style_id,
          name: review.style_name
        })
      }
    }
  })

  reviewArray.forEach(review => {
    review.breweries.sort((a, b) => a.name?.localeCompare(b?.name ?? '') ?? 0)
    review.styles.sort((a, b) => a.name?.localeCompare(b?.name ?? '') ?? 0)
  })

  return reviewArray
}
