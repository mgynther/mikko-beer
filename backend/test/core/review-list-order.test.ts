import { expect } from 'earl'

import {
  validateFilteredReviewListOrder,
  validateFullReviewListOrder
} from '../../src/core/review/review'
import {
  invalidReviewListQueryBeerNameError,
  invalidReviewListQueryBreweryNameError,
  invalidReviewListQueryOrderError
} from '../../src/core/errors'
import { expectThrow } from './controller-error-helper'

function valid (): Record<string, unknown> {
  return { order: 'time', direction: 'desc' }
}

interface CommonCase {
  title: string
  func:
    | typeof validateFullReviewListOrder
    | typeof validateFilteredReviewListOrder
}

describe('review list order unit tests', () => {
  [
    {
      title: 'full review list order',
      func: validateFullReviewListOrder
    },
    {
      title: 'filtered review list order',
      func: validateFilteredReviewListOrder
    }
  ]
  .forEach((test: CommonCase) => {
    it(`valid test helper is valid, ${test.title}`, () => {
      const result = test.func(valid())
      expect(result).toEqual({ property: 'time', direction: 'desc' })
    })

    it(`invalid order value, ${test.title}`, () => {
      expectThrow(
        () => test.func({ ...valid(), order: 'testing' })
      , invalidReviewListQueryOrderError)
    })

    it(`invalid order type, ${test.title}`, () => {
      expectThrow(
        () => test.func( { ...valid(), order: 123 })
      , invalidReviewListQueryOrderError)
    })

    it(`invalid direction value, ${test.title}`, () => {
      expectThrow(
        () => test.func({ ...valid(), direction: 'testing' })
      , invalidReviewListQueryOrderError)
    })

    it(`invalid direction type, ${test.title}`, () => {
      expectThrow(
        () => test.func({ ...valid(), direction: [] })
      , invalidReviewListQueryOrderError)
    })

    it(`time desc, ${test.title}`, () => {
      const result = test.func(
        { order: 'time', direction: 'desc' }
      )
      expect(result).toEqual({ property: 'time', direction: 'desc' })
    })

    it(`rating asc, ${test.title}`, () => {
      const result = test.func(
        { order: 'rating', direction: 'asc' }
      )
      expect(result).toEqual({ property: 'rating', direction: 'asc' })
    })
  })

  it('defaults with undefined, full review list order', () => {
    const result = validateFullReviewListOrder({})
    expect(result).toEqual({ property: 'time', direction: 'desc' })
  })

  it('defaults with undefined, filtered review list order', () => {
    const result = validateFilteredReviewListOrder({})
    expect(result).toEqual({ property: 'beer_name', direction: 'asc' })
  })

  it('defaults with empty string, full review list order', () => {
    const result = validateFullReviewListOrder(
      { order: '', direction: '' },
    )
    expect(result).toEqual({ property: 'time', direction: 'desc' })
  })

  it('defaults with empty string, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: '', direction: '' }
    )
    expect(result).toEqual({ property: 'beer_name', direction: 'asc' })
  })

  it('defaults with empty string, full review list order', () => {
    const result = validateFullReviewListOrder(
      { order: '', direction: '' },
    )
    expect(result).toEqual({ property: 'time', direction: 'desc' })
  })

  it('beer_name, full review list order', () => {
    expectThrow(
      () => validateFullReviewListOrder(
        { order: 'beer_name', direction: 'desc' }
      )
    , invalidReviewListQueryBeerNameError)
  })

  it('beer_name desc, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: 'beer_name', direction: 'desc' }
    )
    expect(result).toEqual({ property: 'beer_name', direction: 'desc' })
  })

  it('brewery_name, full review list order', () => {
    expectThrow(
      () => validateFullReviewListOrder(
        { order: 'brewery_name', direction: 'desc' }
      )
    , invalidReviewListQueryBreweryNameError)
  })

  it('brewery_name asc, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: 'brewery_name', direction: 'asc' }
    )
    expect(result).toEqual({ property: 'brewery_name', direction: 'asc' })
  })
})
