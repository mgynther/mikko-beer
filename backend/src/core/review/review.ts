import { ajv } from '../internal/ajv.js'

import type { Container } from '../container/container.js'
import { directionValidation } from '../internal/list.js'
import type { ListDirection } from '../list.js'

import type { LockId } from '../db.js'
import { parseDate } from '../date-parser.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryFilterError,
  invalidReviewListQueryOrderError,
} from '../errors.js'

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
  | 'beer_name'
  | 'brewery_name'
  | 'rating'
  | 'time'

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

export type CreateReviewRequest = ReviewRequest
export type UpdateReviewRequest = ReviewRequest

const doValidateReviewListOrder = ajv.compile<ReviewListOrder>({
  type: 'object',
  properties: {
    property: {
      enum: ['beer_name', 'brewery_name', 'rating', 'time'],
    },
    direction: directionValidation,
  },
  required: ['property', 'direction'],
  additionalProperties: false,
})

function isReviewListOrderValid(body: unknown): boolean {
  return doValidateReviewListOrder(body)
}

interface ReviewListOrderParams {
  property: unknown
  direction: unknown
}

function reviewListOrderParamsOrDefaults(
  query: Record<string, unknown>,
  defaultProperty: ReviewListOrderProperty,
  defaultDirection: ListDirection,
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

function validReviewListOrder(
  query: Record<string, unknown>,
  defaultProperty: ReviewListOrderProperty,
  defaultDirection: ListDirection,
): ReviewListOrder | undefined {
  const params = reviewListOrderParamsOrDefaults(
    query,
    defaultProperty,
    defaultDirection,
  )
  if (isReviewListOrderValid(params)) {
    return {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      property: params.property as ReviewListOrderProperty,
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Validated using ajv.
       */
      direction: params.direction as ListDirection,
    }
  }
  return undefined
}

export function validateFullReviewListOrder(
  query: Record<string, unknown>,
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

export function validateFilteredReviewListOrder(
  query: Record<string, unknown>,
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query, 'beer_name', 'asc')
  return validateReviewListOrder(reviewListOrder)
}

function validateReviewListOrder(
  reviewListOrder: ReviewListOrder | undefined,
): ReviewListOrder {
  if (reviewListOrder === undefined) {
    throw invalidReviewListQueryOrderError
  }
  return reviewListOrder
}

const defaultReviewListFilter: ReviewListFilter = {
  minRating: 4,
  maxRating: 10,
  minTime: new Date('1970-01-01T00:00:00.000Z'),
  maxTime: new Date('2100-01-01T00:00:00.000Z'),
}

interface ReviewListFilterRatings {
  minRating: number
  maxRating: number
}

const doValidateRatingFilter = ajv.compile<ReviewListFilterRatings>({
  type: 'object',
  properties: {
    minRating: { type: 'integer', minimum: 4, maximum: 10 },
    maxRating: { type: 'integer', minimum: 4, maximum: 10 },
  },
  required: ['minRating', 'maxRating'],
  additionalProperties: false,
})

function ratingOrDefault(value: unknown, defaultValue: number): number {
  if (typeof value !== 'string' || value === '') {
    return defaultValue
  }
  return parseInt(value)
}

function timeOrDefault(value: unknown, defaultValue: Date): Date {
  if (value === undefined || value === '') {
    return defaultValue
  }
  const date = parseDate(value)
  if (date === undefined) {
    throw invalidReviewListQueryFilterError
  }
  return date
}

export function validateReviewListFilter(
  query: Record<string, unknown>,
): ReviewListFilter {
  const { min_rating, max_rating, min_time, max_time } = query
  const ratings = {
    minRating: ratingOrDefault(min_rating, defaultReviewListFilter.minRating),
    maxRating: ratingOrDefault(max_rating, defaultReviewListFilter.maxRating),
  }
  if (!doValidateRatingFilter(ratings)) {
    throw invalidReviewListQueryFilterError
  }
  return {
    minRating: ratings.minRating,
    maxRating: ratings.maxRating,
    minTime: timeOrDefault(min_time, defaultReviewListFilter.minTime),
    maxTime: timeOrDefault(max_time, defaultReviewListFilter.maxTime),
  }
}
