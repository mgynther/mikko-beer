import { ajv } from './internal/ajv.js'
import { parseDate } from './internal/date-parser.js'
import type { ListDirection } from './internal/list.js'
import { directionValidation } from './internal/list.js'
import { timePattern } from './internal/time.js'

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

export type UpdateReviewValidationResult =
  | {
      errorCode: 'invalid-review' | 'invalid-review-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateReviewRequest
    }

export type ValidateReviewIdResult =
  | {
      errorCode: 'invalid-review-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateReviewRequest = ajv.compile<ReviewRequest>({
  type: 'object',
  properties: {
    additionalInfo: {
      type: 'string',
    },
    beer: {
      type: 'string',
      minLength: 1,
    },
    container: {
      type: 'string',
      minLength: 1,
    },
    location: {
      type: 'string',
    },
    rating: {
      type: 'integer',
      minimum: 4,
      maximum: 10,
    },
    smell: {
      type: 'string',
      minLength: 1,
    },
    taste: {
      type: 'string',
      minLength: 1,
    },
    time: {
      type: 'string',
      pattern: timePattern,
    },
  },
  required: [
    'additionalInfo',
    'beer',
    'container',
    'location',
    'rating',
    'smell',
    'taste',
    'time',
  ],
  additionalProperties: false,
})

function isCreateReviewRequestValid(body: unknown): boolean {
  return doValidateReviewRequest(body)
}

function isUpdateReviewRequestValid(body: unknown): boolean {
  return doValidateReviewRequest(body)
}

export function validateCreateReviewRequest(
  body: unknown,
): CreateReviewValidationResult {
  if (!isCreateReviewRequestValid(body)) {
    return { errorCode: 'invalid-review', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateReviewRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateReviewRequest(
  body: unknown,
  reviewId: string | undefined,
): UpdateReviewValidationResult {
  if (!isUpdateReviewRequestValid(body)) {
    return { errorCode: 'invalid-review', result: undefined }
  }
  const validationResult = validateReviewId(reviewId)
  if (validationResult.errorCode === 'invalid-review-id') {
    return { errorCode: 'invalid-review-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateReviewRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateReviewId(
  id: string | undefined,
): ValidateReviewIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-review-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}

export type ReviewListOrderProperty =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export interface ReviewListOrder {
  property: ReviewListOrderProperty
  direction: ListDirection
}

export interface FullReviewListOrder {
  property: 'rating' | 'time'
  direction: ListDirection
}

export interface ReviewListFilter {
  minRating: number
  maxRating: number
  minTime: Date
  maxTime: Date
}

export type FullReviewListOrderValidationResult =
  | {
      errorCode:
        | 'invalid-review-list-query-order'
        | 'invalid-review-list-query-beer-name'
        | 'invalid-review-list-query-brewery-name'
      result: undefined
    }
  | {
      errorCode: undefined
      result: FullReviewListOrder
    }

export type FilteredReviewListOrderValidationResult =
  | {
      errorCode: 'invalid-review-list-query-order'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ReviewListOrder
    }

export type ReviewListFilterValidationResult =
  | {
      errorCode: 'invalid-review-list-query-filter'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ReviewListFilter
    }

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
): FullReviewListOrderValidationResult {
  const reviewListOrder = validReviewListOrder(query, 'time', 'desc')
  if (reviewListOrder === undefined) {
    return { errorCode: 'invalid-review-list-query-order', result: undefined }
  }
  if (reviewListOrder.property === 'beer_name') {
    return {
      errorCode: 'invalid-review-list-query-beer-name',
      result: undefined,
    }
  }
  if (reviewListOrder.property === 'brewery_name') {
    return {
      errorCode: 'invalid-review-list-query-brewery-name',
      result: undefined,
    }
  }
  // The checks above narrow the property but not the object holding it, so
  // the narrowed property goes into a new object.
  return {
    errorCode: undefined,
    result: {
      property: reviewListOrder.property,
      direction: reviewListOrder.direction,
    },
  }
}

export function validateFilteredReviewListOrder(
  query: Record<string, unknown>,
): FilteredReviewListOrderValidationResult {
  const reviewListOrder = validReviewListOrder(query, 'beer_name', 'asc')
  if (reviewListOrder === undefined) {
    return { errorCode: 'invalid-review-list-query-order', result: undefined }
  }
  return { errorCode: undefined, result: reviewListOrder }
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

function timeOrDefault(value: unknown, defaultValue: Date): Date | undefined {
  if (value === undefined || value === '') {
    return defaultValue
  }
  return parseDate(value)
}

export function validateReviewListFilter(
  query: Record<string, unknown>,
): ReviewListFilterValidationResult {
  const { min_rating, max_rating, min_time, max_time } = query
  const ratings = {
    minRating: ratingOrDefault(min_rating, defaultReviewListFilter.minRating),
    maxRating: ratingOrDefault(max_rating, defaultReviewListFilter.maxRating),
  }
  if (!doValidateRatingFilter(ratings)) {
    return { errorCode: 'invalid-review-list-query-filter', result: undefined }
  }
  const minTime = timeOrDefault(min_time, defaultReviewListFilter.minTime)
  const maxTime = timeOrDefault(max_time, defaultReviewListFilter.maxTime)
  if (minTime === undefined || maxTime === undefined) {
    return { errorCode: 'invalid-review-list-query-filter', result: undefined }
  }
  return {
    errorCode: undefined,
    result: {
      minRating: ratings.minRating,
      maxRating: ratings.maxRating,
      minTime,
      maxTime,
    },
  }
}
