import { ajv } from '../ajv'

import type {
  CreateReviewRequest,
  ReviewRequest,
  UpdateReviewRequest
} from '../../review/review'
import { timePattern } from '../time'

import {
  invalidReviewError,
  invalidReviewIdError
} from '../../errors'

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

interface ValidUpdateReviewRequest {
  id: string,
  request: UpdateReviewRequest
}

export function validateUpdateReviewRequest (
  body: unknown,
  reviewId: string | undefined
): ValidUpdateReviewRequest {
  if (!isUpdateReviewRequestValid(body)) {
    throw invalidReviewError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateReviewRequest
  return {
    id: validateReviewId(reviewId),
    request: result
  }
}

export function validateReviewId(id: string | undefined): string {
  if (typeof id !== 'string' || id.length === 0) {
    throw invalidReviewIdError
  }
  return id
}
