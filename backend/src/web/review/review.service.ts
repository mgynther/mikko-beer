import * as reviewRepository from '../../data/review/review.repository'
import * as storageRepository from '../../data/storage/storage.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type JoinedReview,
  type Review,
  type ReviewListOrder
} from '../../core/review/review'
import {
  type DbJoinedReview,
  type ReviewRow
} from '../../data/review/review.table'

import { type Pagination } from '../../core/pagination'

export async function createReview (
  trx: Transaction,
  request: CreateReviewRequest,
  fromStorageId: string | undefined
): Promise<Review> {
  const review = await reviewRepository.insertReview(trx, {
    additional_info: request.additionalInfo,
    beer: request.beer,
    container: request.container,
    location: request.location,
    rating: request.rating,
    smell: request.smell,
    taste: request.taste,
    time: request.time
  })

  if (typeof fromStorageId === 'string') {
    await storageRepository.deleteStorageById(trx, fromStorageId)
  }

  return {
    ...reviewRowToReview(review)
  }
}

export async function updateReview (
  trx: Transaction,
  reviewId: string,
  request: UpdateReviewRequest
): Promise<Review> {
  const review = await reviewRepository.updateReview(trx, reviewId, {
    additional_info: request.additionalInfo,
    beer: request.beer,
    container: request.container,
    location: request.location,
    rating: request.rating,
    smell: request.smell,
    taste: request.taste,
    time: request.time
  })

  return {
    ...reviewRowToReview(review)
  }
}

export async function findReviewById (
  db: Database,
  reviewId: string
): Promise<Review | undefined> {
  const review = await reviewRepository.findReviewById(db, reviewId)

  if (review === null || review === undefined) return undefined

  return reviewRowToReview(review)
}

export async function lockReviewById (
  trx: Transaction,
  id: string
): Promise<Review | undefined> {
  const reviewRow = await reviewRepository.lockReviewById(trx, id)

  if (reviewRow != null) {
    return reviewRowToReview(reviewRow)
  }
}

export async function listReviews (
  db: Database,
  pagination: Pagination,
  query: ReviewListOrder
): Promise<JoinedReview[]> {
  const reviewRows = await reviewRepository.listReviews(db, pagination, query)
  return toJoinedReviews(reviewRows)
}

export async function listReviewsByBeer (
  db: Database,
  beerId: string
): Promise<JoinedReview[]> {
  const reviewRows = await reviewRepository.listReviewsByBeer(db, beerId)
  return toJoinedReviews(reviewRows)
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string
): Promise<JoinedReview[]> {
  const reviewRows = await reviewRepository.listReviewsByBrewery(db, breweryId)
  return toJoinedReviews(reviewRows)
}

function toJoinedReviews (reviewRows: DbJoinedReview[]): JoinedReview[] {
  return reviewRows.map(row => ({
    id: row.review_id,
    additionalInfo: row.additional_info,
    beerId: row.beer_id,
    beerName: row.beer_name,
    breweries: row.breweries.map(brewery => ({
      id: brewery.brewery_id,
      name: brewery.name
    })),
    container: {
      id: row.container_id,
      size: row.container_size,
      type: row.container_type
    },
    location: row.location,
    rating: row.rating,
    styles: row.styles.map(style => ({
      id: style.style_id,
      name: style.name
    })),
    time: row.time
  }))
}

export function reviewRowToReview (review: ReviewRow): Review {
  return {
    id: review.review_id,
    additionalInfo: review.additional_info,
    beer: review.beer,
    container: review.container,
    location: review.location,
    rating: review.rating,
    time: review.time,
    smell: review.smell,
    taste: review.taste
  }
}
