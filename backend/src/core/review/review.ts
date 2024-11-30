import { ajv } from '../ajv'

import type { Container } from '../container/container'
import { type ListDirection, directionValidation } from '../list'
import { timePattern } from '../time'

import {
  invalidReviewError,
  invalidReviewIdError,
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryOrderError
} from '../errors'

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
  additionalInfo: string | null
  beerId: string
  beerName: string | null
  breweries: Array<{
    id: string
    name: string | null
  }>
  container: Container
  location: string | null
  rating: number | null
  styles: Array<{
    id: string
    name: string | null
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

const doValidateReviewRequest =
  ajv.compile<ReviewRequest>({
    type: 'object',
    properties: {
      additionalInfo: {
        type: 'string'
      },
      beer: {
        type: 'string',
        minLength: 1
      },
      container: {
        type: 'string',
        minLength: 1
      },
      location: {
        type: 'string'
      },
      rating: {
        type: 'integer',
        minimum: 4,
        maximum: 10
      },
      smell: {
        type: 'string',
        minLength: 1
      },
      taste: {
        type: 'string',
        minLength: 1
      },
      time: {
        type: 'string',
        pattern: timePattern
      }
    },
    required: ['beer', 'container', 'rating', 'smell', 'taste', 'time'],
    additionalProperties: false
  })

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

function isCreateReviewRequestValid (body: unknown): boolean {
  return doValidateReviewRequest(body)
}

function isUpdateReviewRequestValid (body: unknown): boolean {
  return doValidateReviewRequest(body)
}

export function validateCreateReviewRequest (
  body: unknown
): CreateReviewRequest {
  if (!isCreateReviewRequestValid(body)) {
    throw invalidReviewError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateReviewRequest
  return result
}

export function validateUpdateReviewRequest (
  body: unknown,
  reviewId: string
): UpdateReviewRequest {
  if (!isUpdateReviewRequestValid(body)) {
    throw invalidReviewError
  }
  if (typeof reviewId !== 'string' || reviewId.length === 0) {
    throw invalidReviewIdError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateReviewRequest
  return result
}

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
