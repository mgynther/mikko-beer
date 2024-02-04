import { ajv } from '../ajv'

import { type Container } from '../container/container'
import { type ListDirection, directionValidation } from '../list'
import { timePattern } from '../time'

export interface Review {
  id: string
  additionalInfo: string | null
  beer: string
  container: string
  location: string | null
  rating: number | null
  time: Date
  smell: string | null
  taste: string | null
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
  additionalInfo: string | undefined
  beer: string
  container: string
  location: string | undefined
  rating: number
  smell: string
  taste: string
  time: Date
}

export type ReviewListOrderProperty = 'beer_name' | 'rating' | 'time'

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
        enum: ['beer_name', 'rating', 'time']
      },
      direction: directionValidation
    },
    required: ['property', 'direction'],
    additionalProperties: false
  })

export function validateCreateReviewRequest (body: unknown): boolean {
  return doValidateReviewRequest(body) as boolean
}

export function validateUpdateReviewRequest (body: unknown): boolean {
  return doValidateReviewRequest(body) as boolean
}

function validateReviewListOrder (body: unknown): boolean {
  return doValidateReviewListOrder(body) as boolean
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

export function validReviewListOrder (
  query: Record<string, unknown>,
  defaultProperty: ReviewListOrderProperty,
  defaultDirection: ListDirection
): ReviewListOrder | undefined {
  const params =
    reviewListOrderParamsOrDefaults(query, defaultProperty, defaultDirection)
  if (validateReviewListOrder(params)) {
    return {
      property: params.property as ReviewListOrderProperty,
      direction: params.direction as ListDirection
    }
  }
  return undefined
}
