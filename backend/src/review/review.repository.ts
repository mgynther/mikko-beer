import { sql } from 'kysely'

import { type Database, type Transaction } from '../database'
import {
  type DbJoinedReview,
  type ReviewRow,
  type InsertableReviewRow,
  type UpdateableReviewRow
} from './review.table'

import { type Pagination, toRowNumbers } from '../util/pagination'

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

export async function listReviews (
  db: Database,
  pagination: Pagination
): Promise<DbJoinedReview[]> {
  const { start, end } = toRowNumbers(pagination)
  // Did not find a Kysely way to do a window function subquery and use between
  // comparison, so raw SQL it is. Kysely would be better because of sanity
  // checking and typing would not have to be done manually.
  const reviewQuery = sql`SELECT
    review.review_id, review.additional_info, review.location,
    review.rating, review.time, review.created_at,
    beer.beer_id as beer_id, beer.name as beer_name,
    brewery.brewery_id as brewery_id, brewery.name as brewery_name,
    style.style_id as style_id, style.name as style_name,
    container.container_id as container_id, container.type as container_type,
    container.size as container_size
  FROM (
    SELECT review.*, ROW_NUMBER() OVER(ORDER BY time DESC) rn
    FROM review) review
  INNER JOIN beer ON review.beer = beer.beer_id
  INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
  INNER JOIN brewery ON brewery.brewery_id = beer_brewery.brewery
  INNER JOIN beer_style ON beer.beer_id = beer_style.beer
  INNER JOIN style ON style.style_id = beer_style.style
  INNER JOIN container ON review.container = container.container_id
  WHERE review.rn BETWEEN ${start} AND ${end}
  ORDER BY review.time DESC
  `
  const reviews = (await reviewQuery
    .execute(db.getDb()) as {
    rows: JoinedReview[]
  }).rows

  if (reviews.length === 0) {
    return []
  }

  return parseBreweryReviewRows(reviews)
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string
): Promise<DbJoinedReview[]> {
  const reviews = await db.getDb()
    .selectFrom('beer_brewery as querybrewery')
    .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
    .innerJoin('review', 'beer.beer_id', 'review.beer')
    .innerJoin('beer_brewery', 'beer_brewery.beer', 'beer.beer_id')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('container', 'container.container_id', 'review.container')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .where('querybrewery.brewery', '=', breweryId)
    .select([
      'review.review_id',
      'review.additional_info',
      'beer.beer_id as beer_id',
      'beer.name as beer_name',
      'brewery.brewery_id as brewery_id',
      'brewery.name as brewery_name',
      'container.container_id as container_id',
      'container.size as container_size',
      'container.type as container_type',
      'review.location',
      'review.rating',
      'review.time',
      'review.created_at',
      'style.style_id as style_id',
      'style.name as style_name'
    ])
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
