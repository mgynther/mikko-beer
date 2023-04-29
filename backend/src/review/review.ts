import { ajv } from '../util/ajv'

import { type Container } from '../container/container'

export interface ReviewBasic {
  id: string
  additionalInfo: string | null
  beer: string
  container: string
  location: string | null
  rating: number | null
  time: Date
}

export interface Review extends ReviewBasic {
  smell: string | null
  taste: string | null
}

export interface BreweryReview {
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
        // eslint-disable-next-line max-len
        pattern: '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d.\\d+([+-][0-2]\\d:[0-5]\\d|Z)$'
      }
    },
    required: ['beer', 'container', 'rating', 'smell', 'taste', 'time'],
    additionalProperties: false
  })

export function validateCreateReviewRequest (body: unknown): boolean {
  return doValidateReviewRequest(body) as boolean
}

export function validateUpdateReviewRequest (body: unknown): boolean {
  return doValidateReviewRequest(body) as boolean
}
