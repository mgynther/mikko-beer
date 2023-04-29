import * as reviewRepository from './review.repository'

import { type Database, type Transaction } from '../database'
import {
  type BreweryReview,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewBasic,
  type Review
} from './review'
import { type ReviewBasicRow, type ReviewRow } from './review.table'

export async function createReview (
  trx: Transaction,
  request: CreateReviewRequest
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
  db: Database
): Promise<ReviewBasic[] | undefined> {
  const reviewRows = await reviewRepository.listReviews(db)

  if (reviewRows === null || reviewRows === undefined) return []

  return reviewRows.map(row => ({
    ...reviewBasicRowToReviewBasic(row)
  }))
}

export async function listReviewsByBrewery (
  db: Database,
  breweryId: string
): Promise<BreweryReview[] | undefined> {
  const reviewRows = await reviewRepository.listReviewsByBrewery(db, breweryId)

  if (reviewRows === null || reviewRows === undefined) return []

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

export function reviewBasicRowToReviewBasic (
  review: ReviewBasicRow
): ReviewBasic {
  return {
    id: review.review_id,
    additionalInfo: review.additional_info,
    beer: review.beer,
    container: review.container,
    location: review.location,
    rating: review.rating,
    time: review.time
  }
}

export function reviewRowToReview (review: ReviewRow): Review {
  return {
    ...reviewBasicRowToReviewBasic(review),
    smell: review.smell,
    taste: review.taste
  }
}
