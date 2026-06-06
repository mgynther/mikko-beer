import type { RawBuilder, SelectQueryBuilder } from 'kysely'
import { sql } from 'kysely'

import type { Database, KyselyDatabase, Transaction } from '../database.js'
import type {
  DbJoinedReview,
  ReviewRow,
  ReviewTable,
  ReviewTableContent,
} from './review.table.js'

import type { ListDirection } from '../../core/list.js'
import type { Pagination } from '../../core/pagination.js'
import { toRowNumbers } from '../../core/pagination.js'
import type {
  JoinedReview,
  NewReview,
  Review,
  ReviewListFilter,
  ReviewListOrder,
  ReviewListRequest,
} from '../../core/review/review.js'
import { contains } from '../../core/record.js'

export async function insertReview(
  trx: Transaction,
  review: NewReview,
): Promise<Review> {
  const insertedReview = await trx
    .trx()
    .insertInto('review')
    .values(toRow(review))
    .returningAll()
    .executeTakeFirstOrThrow()

  return toReview(insertedReview)
}

export async function updateReview(
  trx: Transaction,
  review: Review,
): Promise<Review> {
  const updatedReview = await trx
    .trx()
    .updateTable('review')
    .set(toRow(review))
    .where('review_id', '=', review.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return toReview(updatedReview)
}

export async function findReviewById(
  db: Database,
  id: string,
): Promise<Review> {
  const reviewRow = await db
    .getDb()
    .selectFrom('review')
    .where('review_id', '=', id)
    .selectAll('review')
    .executeTakeFirstOrThrow()

  return toReview(reviewRow)
}

interface ReviewTableRn extends ReviewTable {
  rn: number
}

const listByRatingAsc = (
  reviewListFilter: ReviewListFilter,
): RawBuilder<ReviewTableRn> => sql<ReviewTableRn>`(
    SELECT
      review.*,
      ROW_NUMBER() OVER(ORDER BY review.rating ASC, review.time DESC) rn
    FROM review
    WHERE review.rating >= ${reviewListFilter.minRating} AND review.rating <= ${
      reviewListFilter.maxRating
    } AND review.time >= ${reviewListFilter.minTime} AND review.time <= ${
      reviewListFilter.maxTime
    }
  )`

const listByRatingDesc = (
  reviewListFilter: ReviewListFilter,
): RawBuilder<ReviewTableRn> => sql<ReviewTableRn>`(
    SELECT
      review.*,
      ROW_NUMBER() OVER(ORDER BY review.rating DESC, review.time DESC) rn
    FROM review
    WHERE review.rating >= ${reviewListFilter.minRating} AND review.rating <= ${
      reviewListFilter.maxRating
    } AND review.time >= ${reviewListFilter.minTime} AND review.time <= ${
      reviewListFilter.maxTime
    }
  )`

function getListQueryByRating(
  reviewListFilter: ReviewListFilter,
  direction: ListDirection,
): ReturnType<typeof listByRatingAsc> {
  if (direction === 'asc') {
    return listByRatingAsc(reviewListFilter)
  }
  return listByRatingDesc(reviewListFilter)
}

const listByTimeAsc = (
  reviewListFilter: ReviewListFilter,
): RawBuilder<ReviewTableRn> => sql<ReviewTableRn>`(
  SELECT
    review.*,
    ROW_NUMBER() OVER(ORDER BY review.time ASC) rn
  FROM review
  WHERE review.rating >= ${reviewListFilter.minRating} AND review.rating <= ${
    reviewListFilter.maxRating
  } AND review.time >= ${reviewListFilter.minTime} AND review.time <= ${
    reviewListFilter.maxTime
  }
  )`

const listByTimeDesc = (
  reviewListFilter: ReviewListFilter,
): RawBuilder<ReviewTableRn> => sql<ReviewTableRn>`(
  SELECT
    review.*,
    ROW_NUMBER() OVER(ORDER BY review.time DESC) rn
  FROM review
  WHERE review.rating >= ${reviewListFilter.minRating} AND review.rating <= ${
    reviewListFilter.maxRating
  } AND review.time >= ${reviewListFilter.minTime} AND review.time <= ${
    reviewListFilter.maxTime
  }
  )`

function getListQueryByTime(
  reviewListFilter: ReviewListFilter,
  direction: ListDirection,
): ReturnType<typeof listByRatingAsc> {
  if (direction === 'asc') {
    return listByTimeAsc(reviewListFilter)
  }
  return listByTimeDesc(reviewListFilter)
}

type ListQueryBuilder = SelectQueryBuilder<
  KyselyDatabase,
  'review',
  InternalJoinedReview
>

type OrderByGetter = (query: ListQueryBuilder) => ListQueryBuilder

interface ListQueryHelper {
  selectQuery: ReturnType<typeof listByRatingAsc>
  orderBy: OrderByGetter
}

function getOrderByBeerName(direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder =>
    query.orderBy('beer_name', direction).orderBy('review.time', 'asc')
}

// Note that this completely ignores collaborations. If name sorting is wanted
// to take the brewery list name into account, it needs to be done in combining
// the rows.
function getOrderByBreweryName(direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder =>
    query
      .orderBy('brewery_name', direction)
      .orderBy('beer_name', 'asc')
      .orderBy('review.time', 'asc')
}

function getOrderByRating(direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder =>
    query.orderBy('review.rating', direction).orderBy('review.time', 'desc')
}

function getOrderByTime(direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder =>
    query.orderBy('review.time', direction)
}

function getListQueryHelper(
  reviewListRequest: ReviewListRequest,
): ListQueryHelper {
  if (reviewListRequest.order.property === 'beer_name') {
    return {
      selectQuery: getListQueryByRating(
        reviewListRequest.filter,
        reviewListRequest.order.direction,
      ),
      orderBy: getOrderByBeerName(reviewListRequest.order.direction),
    }
  }
  if (reviewListRequest.order.property === 'brewery_name') {
    return {
      selectQuery: getListQueryByRating(
        reviewListRequest.filter,
        reviewListRequest.order.direction,
      ),
      orderBy: getOrderByBreweryName(reviewListRequest.order.direction),
    }
  }
  if (reviewListRequest.order.property === 'rating') {
    return {
      selectQuery: getListQueryByRating(
        reviewListRequest.filter,
        reviewListRequest.order.direction,
      ),
      orderBy: getOrderByRating(reviewListRequest.order.direction),
    }
  }
  return {
    selectQuery: getListQueryByTime(
      reviewListRequest.filter,
      reviewListRequest.order.direction,
    ),
    orderBy: getOrderByTime(reviewListRequest.order.direction),
  }
}

function getOrderBy(reviewListOrder: ReviewListOrder): OrderByGetter {
  if (reviewListOrder.property === 'beer_name') {
    return getOrderByBeerName(reviewListOrder.direction)
  }
  if (reviewListOrder.property === 'brewery_name') {
    return getOrderByBreweryName(reviewListOrder.direction)
  }
  if (reviewListOrder.property === 'rating') {
    return getOrderByRating(reviewListOrder.direction)
  }
  return getOrderByTime(reviewListOrder.direction)
}

type ListPossibleColumns =
  | 'review.review_id'
  | 'review.additional_info'
  | 'review.location'
  | 'review.rating'
  | 'review.time'
  | 'review.created_at'
  | 'beer.beer_id as beer_id'
  | 'beer.name as beer_name'
  | 'brewery.brewery_id as brewery_id'
  | 'brewery.name as brewery_name'
  | 'style.style_id as style_id'
  | 'style.name as style_name'
  | 'container.container_id as container_id'
  | 'container.type as container_type'
  | 'container.size as container_size'
  | 'location.location_id as location_id'
  | 'location.name as location_name'

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
  'container.size as container_size',
  'location.location_id as location_id',
  'location.name as location_name',
]

export async function listReviews(
  db: Database,
  pagination: Pagination,
  reviewListRequest: ReviewListRequest,
): Promise<JoinedReview[]> {
  const { start, end } = toRowNumbers(pagination)

  const queryHelper = getListQueryHelper(reviewListRequest)

  const query = db
    .getDb()
    .selectFrom(queryHelper.selectQuery.as('review'))
    .innerJoin('beer', 'review.beer', 'beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .innerJoin('container', 'review.container', 'container.container_id')
    .leftJoin('location', 'review.location', 'location.location_id')
    .select(listColumns)
    .where((eb) => eb.between('rn', start, end))

  const reviews = await queryHelper.orderBy(query).execute()

  return toJoinedReviews(parseReviewRows(reviews))
}

export async function listReviewsByBeer(
  db: Database,
  beerId: string,
  reviewListRequest: ReviewListRequest,
): Promise<JoinedReview[]> {
  return toJoinedReviews(
    await joinReviewData(
      db.getDb().selectFrom('beer').where('beer.beer_id', '=', beerId),
      reviewListRequest,
    ),
  )
}

export async function listReviewsByBrewery(
  db: Database,
  breweryId: string,
  reviewListRequest: ReviewListRequest,
): Promise<JoinedReview[]> {
  return toJoinedReviews(
    await joinReviewData(
      db
        .getDb()
        .selectFrom('beer_brewery as querybrewery')
        .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
        .where('querybrewery.brewery', '=', breweryId),
      reviewListRequest,
    ),
  )
}

export async function listReviewsByLocation(
  db: Database,
  locationId: string,
  reviewListRequest: ReviewListRequest,
): Promise<JoinedReview[]> {
  const query = db
    .getDb()
    .selectFrom('review')
    .innerJoin('beer', 'review.beer', 'beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .innerJoin('container', 'review.container', 'container.container_id')
    .leftJoin('location', 'review.location', 'location.location_id')
    .select(listColumns)
    .where('review.time', '>=', reviewListRequest.filter.minTime)
    .where('review.time', '<=', reviewListRequest.filter.maxTime)
    .where('review.rating', '>=', reviewListRequest.filter.minRating)
    .where('review.rating', '<=', reviewListRequest.filter.maxRating)
    .where('review.location', '=', locationId)

  const reviews = await getOrderBy(reviewListRequest.order)(query).execute()

  return toJoinedReviews(parseReviewRows(reviews))
}

export async function listReviewsByStyle(
  db: Database,
  styleId: string,
  reviewListRequest: ReviewListRequest,
): Promise<JoinedReview[]> {
  return toJoinedReviews(
    await joinReviewData(
      db
        .getDb()
        .selectFrom('beer_style as querystyle')
        .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
        .where('querystyle.style', '=', styleId),
      reviewListRequest,
    ),
  )
}

async function joinReviewData(
  query: SelectQueryBuilder<KyselyDatabase, 'beer', unknown>,
  reviewListRequest: ReviewListRequest,
): Promise<DbJoinedReview[]> {
  const orderBy = getOrderBy(reviewListRequest.order)

  const selectQuery = query
    .innerJoin('review', 'beer.beer_id', 'review.beer')
    .innerJoin('beer_brewery', 'beer_brewery.beer', 'beer.beer_id')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('container', 'container.container_id', 'review.container')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .leftJoin('location', 'review.location', 'location.location_id')
    .select(listColumns)
    .where('review.time', '>=', reviewListRequest.filter.minTime)
    .where('review.time', '<=', reviewListRequest.filter.maxTime)
    .where('review.rating', '>=', reviewListRequest.filter.minRating)
    .where('review.rating', '<=', reviewListRequest.filter.maxRating)

  const reviews = await orderBy(selectQuery).execute()

  return parseReviewRows(reviews)
}

interface InternalJoinedReview {
  review_id: string
  additional_info: string
  beer_id: string
  beer_name: string
  brewery_id: string
  brewery_name: string
  container_id: string
  container_size: string
  container_type: string
  location_id: string | null
  location_name: string | null
  rating: number
  time: Date
  created_at: Date
  style_id: string
  style_name: string
}

function parseReviewRows(reviews: InternalJoinedReview[]): DbJoinedReview[] {
  const reviewMap: Record<string, DbJoinedReview> = {}
  const reviewArray: DbJoinedReview[] = []

  reviews.forEach((review) => {
    if (contains(reviewMap, review.review_id)) {
      const existing = reviewMap[review.review_id]
      if (
        existing.breweries.find(
          (brewery) => brewery.brewery_id === review.brewery_id,
        ) === undefined
      ) {
        existing.breweries.push({
          brewery_id: review.brewery_id,
          name: review.brewery_name,
        })
      }
      if (
        existing.styles.find(
          (styles) => styles.style_id === review.style_id,
        ) === undefined
      ) {
        existing.styles.push({
          style_id: review.style_id,
          name: review.style_name,
        })
      }
    } else {
      reviewMap[review.review_id] = {
        ...review,
        location:
          review.location_id && review.location_name
            ? {
                location_id: review.location_id,
                name: review.location_name,
              }
            : null,
        breweries: [
          {
            brewery_id: review.brewery_id,
            name: review.brewery_name,
          },
        ],
        styles: [
          {
            style_id: review.style_id,
            name: review.style_name,
          },
        ],
      }
      reviewArray.push(reviewMap[review.review_id])
    }
  })

  reviewArray.forEach((review) => {
    review.breweries.sort((a, b) => a.name.localeCompare(b.name))
    review.styles.sort((a, b) => a.name.localeCompare(b.name))
  })

  return reviewArray
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.review_id,
    additionalInfo: row.additional_info,
    beer: row.beer,
    container: row.container,
    location: row.location ?? '',
    rating: row.rating,
    time: row.time,
    smell: row.smell,
    taste: row.taste,
  }
}

function toJoinedReviews(reviewRows: DbJoinedReview[]): JoinedReview[] {
  return reviewRows.map((row) => ({
    id: row.review_id,
    additionalInfo: row.additional_info,
    beerId: row.beer_id,
    beerName: row.beer_name,
    breweries: row.breweries.map((brewery) => ({
      id: brewery.brewery_id,
      name: brewery.name,
    })),
    container: {
      id: row.container_id,
      size: row.container_size,
      type: row.container_type,
    },
    location:
      row.location === null
        ? undefined
        : {
            id: row.location.location_id,
            name: row.location.name,
          },
    rating: row.rating,
    styles: row.styles.map((style) => ({
      id: style.style_id,
      name: style.name,
    })),
    time: row.time,
  }))
}

function toRow(review: NewReview | Review): ReviewTableContent {
  return {
    additional_info: review.additionalInfo,
    beer: review.beer,
    container: review.container,
    location: review.location.length > 0 ? review.location : null,
    rating: review.rating,
    smell: review.smell,
    taste: review.taste,
    time: review.time,
  }
}
