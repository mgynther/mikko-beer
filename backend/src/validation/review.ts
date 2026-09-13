import { ajv } from './internal/ajv.js'
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
