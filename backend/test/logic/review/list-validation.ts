import type { Pagination } from '../../../src/logic/pagination.js'
import type {
  FullReviewListRequest,
  ReviewListQuery,
  ReviewListRequest,
  ValidateFilteredReviewList,
  ValidateFullReviewList,
} from '../../../src/logic/review/review.js'

// A query as the request carries it when it leaves everything to the
// defaults.
export const defaultReviewListQuery: ReviewListQuery = {
  order: undefined,
  direction: undefined,
  minRating: undefined,
  maxRating: undefined,
  minTime: undefined,
  maxTime: undefined,
}

export function passFilteredReviewListValidation(
  request: ReviewListRequest,
): ValidateFilteredReviewList {
  return {
    order: () => ({ errorCode: undefined, result: request.order }),
    filter: () => ({ errorCode: undefined, result: request.filter }),
  }
}

export function passFullReviewListValidation(
  request: FullReviewListRequest,
  pagination: Pagination,
): ValidateFullReviewList {
  return {
    order: () => ({ errorCode: undefined, result: request.order }),
    filter: () => ({ errorCode: undefined, result: request.filter }),
    pagination: () => ({ errorCode: undefined, result: pagination }),
  }
}
