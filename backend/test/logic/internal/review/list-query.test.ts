import { suite, test } from '../../../test.js'

import {
  validFilteredReviewListRequest,
  validFullReviewListRequest,
} from '../../../../src/logic/internal/review/list-query.js'
import type {
  FullReviewListOrderValidationResult,
  ReviewListOrderQuery,
  ValidateFilteredReviewList,
  ValidateFullReviewList,
} from '../../../../src/logic/review/review.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryFilterError,
  invalidReviewListQueryOrderError,
} from '../../../../src/logic/errors.js'
import { expectThrow } from '../../controller-error-helper.js'
import { assertDeepEqual } from '../../../assert.js'
import { mockFunction } from '../../../mock.js'
import { buildReviewListFilter } from '../../review/builders.js'
import {
  defaultReviewListQuery,
  passFilteredReviewListValidation,
  passFullReviewListValidation,
} from '../../review/list-validation.js'

const filter = buildReviewListFilter({ minRating: 5, maxRating: 9 })

const validFiltered: ValidateFilteredReviewList =
  passFilteredReviewListValidation({
    filter,
    order: { property: 'beer_name', direction: 'desc' },
  })

const validFull: ValidateFullReviewList = passFullReviewListValidation(
  { filter, order: { property: 'rating', direction: 'asc' } },
  { size: 10000, skip: 0 },
)

function failFullOrder(
  errorCode: NonNullable<FullReviewListOrderValidationResult['errorCode']>,
): ValidateFullReviewList {
  return {
    ...validFull,
    order: () => ({ errorCode, result: undefined }),
  }
}

suite('review list query', () => {
  test('return full review list request', () => {
    const result = validFullReviewListRequest(validFull, defaultReviewListQuery)
    assertDeepEqual(result, {
      filter,
      order: { property: 'rating', direction: 'asc' },
    })
  })

  test('validate full review list order from the query', () => {
    const order = mockFunction<
      [query: ReviewListOrderQuery],
      FullReviewListOrderValidationResult
    >(() => ({
      errorCode: undefined,
      result: { property: 'rating', direction: 'asc' },
    }))
    const query = { ...defaultReviewListQuery, order: 'rating' }
    validFullReviewListRequest({ ...validFull, order }, query)
    assertDeepEqual(
      order.mock.calls.map((call) => call.arguments),
      [[query]],
    )
  })

  test('throw order error for invalid full review list order', () => {
    expectThrow(
      () =>
        validFullReviewListRequest(
          failFullOrder('invalid-review-list-query-order'),
          defaultReviewListQuery,
        ),
      invalidReviewListQueryOrderError,
    )
  })

  test('throw beer name error for full review list order', () => {
    expectThrow(
      () =>
        validFullReviewListRequest(
          failFullOrder('invalid-review-list-query-beer-name'),
          defaultReviewListQuery,
        ),
      invalidReviewListQueryBeerNameError,
    )
  })

  test('throw brewery name error for full review list order', () => {
    expectThrow(
      () =>
        validFullReviewListRequest(
          failFullOrder('invalid-review-list-query-brewery-name'),
          defaultReviewListQuery,
        ),
      invalidReviewListQueryBreweryNameError,
    )
  })

  test('throw filter error for invalid full review list filter', () => {
    expectThrow(
      () =>
        validFullReviewListRequest(
          {
            ...validFull,
            filter: () => ({
              errorCode: 'invalid-review-list-query-filter',
              result: undefined,
            }),
          },
          defaultReviewListQuery,
        ),
      invalidReviewListQueryFilterError,
    )
  })

  test('return filtered review list request', () => {
    const result = validFilteredReviewListRequest(
      validFiltered,
      defaultReviewListQuery,
    )
    assertDeepEqual(result, {
      filter,
      order: { property: 'beer_name', direction: 'desc' },
    })
  })

  test('throw order error for invalid filtered review list order', () => {
    expectThrow(
      () =>
        validFilteredReviewListRequest(
          {
            ...validFiltered,
            order: () => ({
              errorCode: 'invalid-review-list-query-order',
              result: undefined,
            }),
          },
          defaultReviewListQuery,
        ),
      invalidReviewListQueryOrderError,
    )
  })

  test('throw filter error for invalid filtered review list filter', () => {
    expectThrow(
      () =>
        validFilteredReviewListRequest(
          {
            ...validFiltered,
            filter: () => ({
              errorCode: 'invalid-review-list-query-filter',
              result: undefined,
            }),
          },
          defaultReviewListQuery,
        ),
      invalidReviewListQueryFilterError,
    )
  })
})
