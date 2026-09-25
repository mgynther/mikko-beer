import type { Container } from '../container/container.js'
import type { ListDirection } from '../list.js'

import type { LockId } from '../db.js'

export interface CreateIf {
  createReview: (review: NewReview) => Promise<Review>
  deleteFromStorage: (storageId: string) => Promise<void>
  lockBeer: LockId
  lockContainer: LockId
  lockStorage: LockId
}

export interface UpdateIf {
  updateReview: (review: Review) => Promise<Review>
  lockBeer: LockId
  lockContainer: LockId
}

export interface Review {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  time: Date
  smell: string
  taste: string
}

export interface NewReview {
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  time: Date
  smell: string
  taste: string
}

export interface JoinedReview {
  id: string
  additionalInfo: string
  beerId: string
  beerName: string
  breweries: Array<{
    id: string
    name: string
  }>
  container: Container
  location:
    | {
        id: string
        name: string
      }
    | undefined
  rating: number
  styles: Array<{
    id: string
    name: string
  }>
  time: Date
}

export interface ReviewRequest {
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  smell: string
  taste: string
  time: string
}

export type ReviewListOrderProperty =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export interface ReviewListOrder {
  property: ReviewListOrderProperty
  direction: ListDirection
}

export interface ReviewListFilter {
  minRating: number
  maxRating: number
  minTime: Date
  maxTime: Date
}

export interface ReviewListRequest {
  filter: ReviewListFilter
  order: ReviewListOrder
}

export interface FullReviewListOrder {
  property: 'rating' | 'time'
  direction: ListDirection
}

export interface FullReviewListRequest {
  filter: ReviewListFilter
  order: FullReviewListOrder
}

export type CreateReviewRequest = ReviewRequest
export type UpdateReviewRequest = ReviewRequest

export interface ValidUpdateReviewRequest {
  id: string
  request: UpdateReviewRequest
}

export type CreateReviewValidationResult =
  | {
      errorCode: 'invalid-review'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateReviewRequest
    }

export type ValidateCreateReview = (
  body: unknown,
) => CreateReviewValidationResult

export type UpdateReviewValidationResult =
  | {
      errorCode: 'invalid-review' | 'invalid-review-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateReviewRequest
    }

export type ValidateUpdateReview = (
  body: unknown,
  id: string | undefined,
) => UpdateReviewValidationResult

export type ValidateReviewIdResult =
  | {
      errorCode: 'invalid-review-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateReviewId = (
  id: string | undefined,
) => ValidateReviewIdResult
