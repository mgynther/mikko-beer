import type { SelectQueryBuilder } from 'kysely'
import { sql } from 'kysely'

import type {
  Database,
  KyselyDatabase,
  Transaction
} from '../database'
import type {
  DbJoinedReview,
  ReviewRow,
  ReviewTable,
  ReviewTableContent
} from './review.table'

import type { ListDirection } from '../../core/list'
import type { Pagination } from '../../core/pagination'
import { toRowNumbers } from '../../core/pagination'
import type {
  JoinedReview,
  NewReview,
  Review,
  ReviewListOrder
} from '../../core/review/review'
import { contains } from '../../core/record'

export async function insertReview (
  trx: Transaction,
  review: NewReview
): Promise<Review> {
  const insertedReview = await trx.trx()
    .insertInto('review')
    .values(toRow(review))
    .returningAll()
    .executeTakeFirstOrThrow()

  return toReview(insertedReview)
}

export async function updateReview (
  trx: Transaction,
  review: Review
): Promise<Review> {
  const updatedReview = await trx.trx()
    .updateTable('review')
    .set(toRow(review))
    .where('review_id', '=', review.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return toReview(updatedReview)
}

export async function findReviewById (
  db: Database,
  id: string
): Promise<Review> {
  const reviewRow = await db.getDb()
    .selectFrom('review')
    .where('review_id', '=', id)
    .selectAll('review')
    .executeTakeFirstOrThrow()

  return toReview(reviewRow)
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
  SelectQueryBuilder<KyselyDatabase, 'review', InternalJoinedReview>

type OrderByGetter = (query: ListQueryBuilder) => ListQueryBuilder

interface ListQueryHelper {
  selectQuery: typeof listByRatingAsc
  orderBy: OrderByGetter
}

function getOrderByBeerName (direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder => query
      .orderBy('beer_name', direction)
      .orderBy('review.time', 'asc')
}

// Note that this completely ignores collaborations. If name sorting is wanted
// to take the brewery list name into account, it needs to be done in combining
// the rows.
function getOrderByBreweryName (direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder => query
      .orderBy('brewery_name', direction)
      .orderBy('beer_name', 'asc')
      .orderBy('review.time', 'asc')
}

function getOrderByRating (direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder => query
      .orderBy('review.rating', direction)
      .orderBy('review.time', 'desc')
}

function getOrderByTime (direction: ListDirection) {
  return (query: ListQueryBuilder): ListQueryBuilder =>
    query.orderBy('review.time', direction)
}

function getListQueryHelper (
  reviewListOrder: ReviewListOrder
): ListQueryHelper {
  if (reviewListOrder.property === 'beer_name') {
    return {
      selectQuery: getListQueryByRating(reviewListOrder.direction),
      orderBy: getOrderByBeerName(reviewListOrder.direction)
    }
  }
  if (reviewListOrder.property === 'brewery_name') {
    return {
      selectQuery: getListQueryByRating(reviewListOrder.direction),
      orderBy: getOrderByBreweryName(reviewListOrder.direction)
    }
  }
  if (reviewListOrder.property === 'rating') {
    return {
      selectQuery: getListQueryByRating(reviewListOrder.direction),
      orderBy: getOrderByRating(reviewListOrder.direction)
    }
  }
  return {
    selectQuery: getListQueryByTime(reviewListOrder.direction),
    orderBy: getOrderByTime(reviewListOrder.direction)
  }
}

function getOrderBy (
  reviewListOrder: ReviewListOrder
): OrderByGetter {
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
  'container.size as container_size' |
  'location.location_id as location_id' |
  'location.name as location_name'

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

export async function listReviews (
  db: Database,
  pagination: Pagination,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
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
    .leftJoin('location', 'review.location', 'location.location_id')
    .select(listColumns)
    .where((eb) => eb.between('rn', start, end))

  const reviews = await queryHelper.orderBy(query)
    .execute()

  if (reviews.length === 0) {
    return []
  }

  return toJoinedReviews(parseReviewRows(reviews))
}

export async function listReviewsByBeer (
  db: Database,
  beerId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return toJoinedReviews(await joinReviewData(db.getDb()
    .selectFrom('beer')
    .where('beer.beer_id', '=', beerId),
  reviewListOrder
  ))
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return toJoinedReviews(await joinReviewData(db.getDb()
    .selectFrom('beer_brewery as querybrewery')
    .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
    .where('querybrewery.brewery', '=', breweryId),
  reviewListOrder
  ))
}
export async function listReviewsByStyle (
  db: Database,
  styleId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return toJoinedReviews(await joinReviewData(db.getDb()
    .selectFrom('beer_style as querystyle')
    .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
    .where('querystyle.style', '=', styleId),
  reviewListOrder
  ))
}

async function joinReviewData (
  query: SelectQueryBuilder<KyselyDatabase, 'beer', unknown>,
  reviewListOrder: ReviewListOrder
): Promise<DbJoinedReview[]> {
  const orderBy = getOrderBy(reviewListOrder)

  const selectQuery = query
    .innerJoin('review', 'beer.beer_id', 'review.beer')
    .innerJoin('beer_brewery', 'beer_brewery.beer', 'beer.beer_id')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('container', 'container.container_id', 'review.container')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .leftJoin('location', 'review.location', 'location.location_id')
    .select(listColumns)

  const reviews = await orderBy(selectQuery)
    .execute()

  if (reviews.length === 0) {
    return []
  }
  return parseReviewRows(reviews)
}

interface InternalJoinedReview {
  review_id: string
  additional_info: string | null
  beer_id: string
  beer_name: string | null
  brewery_id: string
  brewery_name: string | null
  container_id: string
  container_size: string | null
  container_type: string | null
  location_id: string | null
  location_name: string | null
  rating: number | null
  time: Date
  created_at: Date
  style_id: string
  style_name: string | null
}

function parseReviewRows (
  reviews: InternalJoinedReview[]
): DbJoinedReview[] {
  const reviewMap: Record<string, DbJoinedReview> = {}
  const reviewArray: DbJoinedReview[] = []

  reviews.forEach(review => {
    if (!contains(reviewMap, review.review_id)) {
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
    review.breweries.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
    review.styles.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
  })

  return reviewArray
}

function toReview (row: ReviewRow): Review {
  return {
    id: row.review_id,
    additionalInfo: row.additional_info ?? '',
    beer: row.beer,
    container: row.container,
    location: row.location ?? '',
    rating: row.rating ?? 4,
    time: row.time,
    smell: row.smell ?? '',
    taste: row.taste ?? ''
  }
}

function toJoinedReviews (reviewRows: DbJoinedReview[]): JoinedReview[] {
  return reviewRows.map(row => ({
    id: row.review_id,
    additionalInfo: row.additional_info ?? '',
    beerId: row.beer_id,
    beerName: row.beer_name ?? '',
    breweries: row.breweries.map(brewery => ({
      id: brewery.brewery_id,
      name: brewery.name ?? ''
    })),
    container: {
      id: row.container_id,
      size: row.container_size ?? '',
      type: row.container_type ?? ''
    },
    location: row.location_id === null ? undefined : {
      id: row.location_id,
      name: row.location_name ?? '',
    },
    rating: row.rating ?? 4,
    styles: row.styles.map(style => ({
      id: style.style_id,
      name: style.name ?? ''
    })),
    time: row.time
  }))
}

function toRow (review: NewReview | Review): ReviewTableContent {
  return {
    additional_info: review.additionalInfo,
    beer: review.beer,
    container: review.container,
    location: review.location.length > 0 ? review.location : null,
    rating: review.rating,
    smell: review.smell,
    taste: review.taste,
    time: review.time
  }
}
