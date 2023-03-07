import { type Database, type Transaction } from '../database'
import { type ReviewRow, type InsertableReviewRow, type UpdateableReviewRow } from './review.table'

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
): Promise<ReviewRow[] | undefined> {
  const reviews = await db.getDb()
    .selectFrom('review')
    .selectAll('review')
    .execute()

  if (reviews.length === 0) {
    return undefined
  }

  return [...reviews]
}
