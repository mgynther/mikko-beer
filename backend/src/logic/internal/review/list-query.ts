import type {
  FullReviewListOrder,
  FullReviewListRequest,
  ReviewListFilter,
  ReviewListFilterQuery,
  ReviewListOrderQuery,
  ReviewListQuery,
  ReviewListRequest,
  ValidateFilteredReviewList,
  ValidateFullReviewList,
  ValidateFullReviewListOrder,
  ValidateReviewListFilter,
} from '../../review/review.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryFilterError,
  invalidReviewListQueryOrderError,
} from '../../errors.js'

export function validFilteredReviewListRequest(
  validate: ValidateFilteredReviewList,
  query: ReviewListQuery,
): ReviewListRequest {
  const orderResult = validate.order(query)
  if (orderResult.errorCode === 'invalid-review-list-query-order') {
    throw invalidReviewListQueryOrderError
  }
  return {
    filter: validFilter(validate.filter, query),
    order: orderResult.result,
  }
}

export function validFullReviewListRequest(
  validate: ValidateFullReviewList,
  query: ReviewListQuery,
): FullReviewListRequest {
  const filter = validFilter(validate.filter, query)
  return {
    filter,
    order: validFullOrder(validate.order, query),
  }
}

function validFullOrder(
  validateOrder: ValidateFullReviewListOrder,
  query: ReviewListOrderQuery,
): FullReviewListOrder {
  const orderResult = validateOrder(query)
  if (orderResult.errorCode !== undefined) {
    switch (orderResult.errorCode) {
      case 'invalid-review-list-query-order':
        throw invalidReviewListQueryOrderError
      case 'invalid-review-list-query-beer-name':
        throw invalidReviewListQueryBeerNameError
      case 'invalid-review-list-query-brewery-name':
        throw invalidReviewListQueryBreweryNameError
    }
  }
  return orderResult.result
}

function validFilter(
  validateFilter: ValidateReviewListFilter,
  query: ReviewListFilterQuery,
): ReviewListFilter {
  const filterResult = validateFilter(query)
  if (filterResult.errorCode === 'invalid-review-list-query-filter') {
    throw invalidReviewListQueryFilterError
  }
  return filterResult.result
}
