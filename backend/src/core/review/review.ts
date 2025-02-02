import { ajv } from '../internal/ajv'

import type { Container } from '../container/container'
import { directionValidation } from '../internal/list'
import type { ListDirection } from '../list'

import type { LockId } from '../db'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryOrderError
} from '../errors'

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
  location: {
    id: string
    name: string
  } | undefined
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
  | 'beer_name'
  | 'brewery_name'
  | 'rating'
  | 'time'

export interface ReviewListOrder {
  property: ReviewListOrderProperty
  direction: ListDirection
}

export type CreateReviewRequest = ReviewRequest
export type UpdateReviewRequest = ReviewRequest

const doValidateReviewListOrder =
  ajv.compile<ReviewListOrder>({
    type: 'object',
    properties: {
      property: {
        enum: ['beer_name', 'brewery_name', 'rating', 'time']
      },
      direction: directionValidation
    },
    required: ['property', 'direction'],
    additionalProperties: false
  })


function isReviewListOrderValid (body: unknown): boolean {
  return doValidateReviewListOrder(body)
}

interface ReviewListOrderParams {
  property: unknown
  direction: unknown
}

function reviewListOrderParamsOrDefaults (
  query: Record<string, unknown>,
  defaultProperty: ReviewListOrderProperty,
  defaultDirection: ListDirection
): ReviewListOrderParams {
  let { order, direction } = query
  if (order === undefined || order === '') {
    order = defaultProperty
  }
  if (direction === undefined || direction === '') {
    direction = defaultDirection
  }
  return { property: order, direction }
}

function validReviewListOrder (
  query: Record<string, unknown>,
  defaultProperty: ReviewListOrderProperty,
  defaultDirection: ListDirection
): ReviewListOrder | undefined {
  const params =
    reviewListOrderParamsOrDefaults(query, defaultProperty, defaultDirection)
  if (isReviewListOrderValid(params)) {
    return {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as ReviewListOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection
    }
  }
  return undefined
}

export function validateFullReviewListOrder (
  query: Record<string, unknown>
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query, 'time', 'desc')
  const validated = validateReviewListOrder(reviewListOrder)

  if (validated.property === 'beer_name') {
    throw invalidReviewListQueryBeerNameError
  }
  if (validated.property === 'brewery_name') {
    throw invalidReviewListQueryBreweryNameError
  }
  return validated
}

export function validateFilteredReviewListOrder (
  query: Record<string, unknown>
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query, 'beer_name', 'asc')
  return validateReviewListOrder(reviewListOrder)
}

function validateReviewListOrder (
  reviewListOrder: ReviewListOrder | undefined
): ReviewListOrder {
  if (reviewListOrder === undefined) {
    throw invalidReviewListQueryOrderError
  }
  return reviewListOrder
}
