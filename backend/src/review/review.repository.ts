import { type Database, type Transaction } from '../database'
import {
  type BreweryReviewRow,
  type ReviewBasicRow,
  type ReviewRow,
  type InsertableReviewRow,
  type UpdateableReviewRow
} from './review.table'

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
  db: Database
): Promise<ReviewBasicRow[] | undefined> {
  const reviews = await db.getDb()
    .selectFrom('review')
    .select([
      'review.review_id',
      'review.additional_info',
      'review.beer',
      'review.container',
      'review.location',
      'review.rating',
      'review.smell',
      'review.taste',
      'review.time',
      'review.created_at'
    ])
    .execute()

  if (reviews.length === 0) {
    return undefined
  }

  return [...reviews]
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string
): Promise<BreweryReviewRow[] | undefined> {
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
      'review.smell',
      'review.taste',
      'review.time',
      'review.created_at',
      'style.style_id as style_id',
      'style.name as style_name'
    ])
    .execute()

  if (reviews.length === 0) {
    return undefined
  }

  const reviewMap: Record<string, BreweryReviewRow> = {}
  const reviewArray: BreweryReviewRow[] = []

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
