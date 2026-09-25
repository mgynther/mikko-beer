import {
  validateFilteredReviewListOrder as doValidateFilteredReviewListOrder,
  validateFullReviewListOrder as doValidateFullReviewListOrder,
  validateReviewListFilter as doValidateReviewListFilter,
} from '../../validation/review.js'

import type {
  FullReviewListOrder,
  ReviewListFilter,
  ReviewListOrder,
} from '../../logic/review/review.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryFilterError,
  invalidReviewListQueryOrderError,
} from '../../logic/errors.js'

export function validateFullReviewListOrder(
  query: Record<string, unknown>,
): FullReviewListOrder {
  const validationResult = doValidateFullReviewListOrder(query)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-review-list-query-order':
        throw invalidReviewListQueryOrderError
      case 'invalid-review-list-query-beer-name':
        throw invalidReviewListQueryBeerNameError
      case 'invalid-review-list-query-brewery-name':
        throw invalidReviewListQueryBreweryNameError
    }
  }
  return validationResult.result
}

export function validateFilteredReviewListOrder(
  query: Record<string, unknown>,
): ReviewListOrder {
  const validationResult = doValidateFilteredReviewListOrder(query)
  if (validationResult.errorCode === 'invalid-review-list-query-order') {
    throw invalidReviewListQueryOrderError
  }
  return validationResult.result
}

export function validateReviewListFilter(
  query: Record<string, unknown>,
): ReviewListFilter {
  const validationResult = doValidateReviewListFilter(query)
  if (validationResult.errorCode === 'invalid-review-list-query-filter') {
    throw invalidReviewListQueryFilterError
  }
  return validationResult.result
}
