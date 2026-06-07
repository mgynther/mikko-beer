import { describe, it } from 'node:test'

import {
  validateFullReviewListOrder,
  validateFilteredReviewListOrder,
} from '../../../src/core/review/review.js'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryOrderError,
} from '../../../src/core/errors.js'
import { expectThrow } from '../controller-error-helper.js'
import { assertDeepEqual } from '../../assert.js'

interface ReviewListOrderQuery {
  order: string
  direction: string
}

describe('full review list order unit tests', () => {
  it('defaults to time descending when order and direction are missing', () => {
    assertDeepEqual(validateFullReviewListOrder({}), {
      property: 'time',
      direction: 'desc',
    })
  })

  it('returns the order and direction with rating asc', () => {
    const validQuery: ReviewListOrderQuery = {
      order: 'rating',
      direction: 'asc',
    }
    assertDeepEqual(validateFullReviewListOrder({ ...validQuery }), {
      property: 'rating',
      direction: 'asc',
    })
  })

  it('returns the order and direction with time desc', () => {
    const validQuery: ReviewListOrderQuery = {
      order: 'time',
      direction: 'desc',
    }
    assertDeepEqual(validateFullReviewListOrder({ ...validQuery }), {
      property: 'time',
      direction: 'desc',
    })
  })

  const validFullQuery: ReviewListOrderQuery = {
    order: 'rating',
    direction: 'asc',
  }

  const invalidFullCases: ReviewListOrderQuery[] = [
    { ...validFullQuery, order: 'invalid' },
    { ...validFullQuery, direction: 'invalid' },
  ]

  invalidFullCases.forEach((test) => {
    it(`throws an order error when order is ${test.order} and direction is ${
      test.direction
    }`, () => {
      expectThrow(
        () => validateFullReviewListOrder({ ...test }),
        invalidReviewListQueryOrderError,
      )
    })
  })

  it('throws a beer name error when ordering by beer name', () => {
    expectThrow(
      () =>
        validateFullReviewListOrder({ order: 'beer_name', direction: 'asc' }),
      invalidReviewListQueryBeerNameError,
    )
  })

  it('throws a brewery name error when ordering by brewery name', () => {
    expectThrow(
      () =>
        validateFullReviewListOrder({
          order: 'brewery_name',
          direction: 'asc',
        }),
      invalidReviewListQueryBreweryNameError,
    )
  })
})

describe('filtered review list order unit tests', () => {
  it('defaults to beer name ascending when order and direction are missing', () => {
    assertDeepEqual(validateFilteredReviewListOrder({}), {
      property: 'beer_name',
      direction: 'asc',
    })
  })

  it('returns the order and direction with brewery_name desc', () => {
    const validQuery: ReviewListOrderQuery = {
      order: 'brewery_name',
      direction: 'desc',
    }
    assertDeepEqual(validateFilteredReviewListOrder({ ...validQuery }), {
      property: 'brewery_name',
      direction: 'desc',
    })
  })

  it('returns the order and direction with time asc', () => {
    const validQuery: ReviewListOrderQuery = {
      order: 'time',
      direction: 'asc',
    }
    assertDeepEqual(validateFilteredReviewListOrder({ ...validQuery }), {
      property: 'time',
      direction: 'asc',
    })
  })

  it('returns the order and direction with rating desc', () => {
    const validQuery: ReviewListOrderQuery = {
      order: 'rating',
      direction: 'desc',
    }
    assertDeepEqual(validateFilteredReviewListOrder({ ...validQuery }), {
      property: 'rating',
      direction: 'desc',
    })
  })

  const validFilteredQuery: ReviewListOrderQuery = {
    order: 'brewery_name',
    direction: 'desc',
  }

  const invalidFilteredCases: ReviewListOrderQuery[] = [
    { ...validFilteredQuery, order: 'invalid' },
    { ...validFilteredQuery, direction: 'invalid' },
  ]

  invalidFilteredCases.forEach((test) => {
    it(`throws an order error when order is ${test.order} and direction is ${
      test.direction
    }`, () => {
      expectThrow(
        () => validateFilteredReviewListOrder({ ...test }),
        invalidReviewListQueryOrderError,
      )
    })
  })
})
