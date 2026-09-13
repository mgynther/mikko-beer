import { describe, it } from 'node:test'

import {
  validateFilteredReviewListOrder,
  validateFullReviewListOrder,
  validateReviewListFilter,
} from '../../../src/web/review/review-list-helper.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryFilterError,
  invalidReviewListQueryOrderError,
} from '../../../src/logic/errors.js'
import { expectThrow } from '../../logic/controller-error-helper.js'
import { assertDeepEqual } from '../../assert.js'

describe('review list helper tests', () => {
  it('return full review list order', () => {
    const result = validateFullReviewListOrder({
      order: 'rating',
      direction: 'asc',
    })
    assertDeepEqual(result, { property: 'rating', direction: 'asc' })
  })

  it('throw order error for invalid full review list order', () => {
    expectThrow(
      () => validateFullReviewListOrder({ order: 'invalid' }),
      invalidReviewListQueryOrderError,
    )
  })

  it('throw beer name error for full review list order', () => {
    expectThrow(
      () =>
        validateFullReviewListOrder({ order: 'beer_name', direction: 'asc' }),
      invalidReviewListQueryBeerNameError,
    )
  })

  it('throw brewery name error for full review list order', () => {
    expectThrow(
      () =>
        validateFullReviewListOrder({
          order: 'brewery_name',
          direction: 'asc',
        }),
      invalidReviewListQueryBreweryNameError,
    )
  })

  it('return filtered review list order', () => {
    const result = validateFilteredReviewListOrder({
      order: 'beer_name',
      direction: 'desc',
    })
    assertDeepEqual(result, { property: 'beer_name', direction: 'desc' })
  })

  it('throw order error for invalid filtered review list order', () => {
    expectThrow(
      () => validateFilteredReviewListOrder({ direction: 'invalid' }),
      invalidReviewListQueryOrderError,
    )
  })

  it('return review list filter', () => {
    const minTime = 1678334400000
    const maxTime = 1746792000000
    const result = validateReviewListFilter({
      min_rating: '5',
      max_rating: '9',
      min_time: `${minTime}`,
      max_time: `${maxTime}`,
    })
    assertDeepEqual(result, {
      minRating: 5,
      maxRating: 9,
      minTime: new Date(minTime),
      maxTime: new Date(maxTime),
    })
  })

  it('throw filter error for invalid review list filter', () => {
    expectThrow(
      () => validateReviewListFilter({ min_rating: 'invalid' }),
      invalidReviewListQueryFilterError,
    )
  })
})
