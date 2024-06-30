import { expect } from 'chai'

import {
  validateFilteredReviewListOrder,
  validateFullReviewListOrder
} from '../../../src/core/review/review'
import { invalidReviewListQueryBeerNameError, invalidReviewListQueryBreweryNameError, invalidReviewListQueryOrderError } from '../../../src/core/errors'

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
      expect(result).to.eql({ property: 'time', direction: 'desc' })
    })

    it(`invalid order value, ${test.title}`, () => {
      expect(
        () => test.func({ ...valid(), order: 'testing' })
      ).to.throw(invalidReviewListQueryOrderError)
    })

    it(`invalid order type, ${test.title}`, () => {
      expect(
        () => test.func( { ...valid(), order: 123 })
      ).to.throw(invalidReviewListQueryOrderError)
    })

    it(`invalid direction value, ${test.title}`, () => {
      expect(
        () => test.func({ ...valid(), direction: 'testing' })
      ).to.throw(invalidReviewListQueryOrderError)
    })

    it(`invalid direction type, ${test.title}`, () => {
      expect(
        () => test.func({ ...valid(), direction: [] })
      ).to.throw(invalidReviewListQueryOrderError)
    })

    it(`time desc, ${test.title}`, () => {
      const result = test.func(
        { order: 'time', direction: 'desc' }
      )
      expect(result).eql({ property: 'time', direction: 'desc' })
    })

    it(`rating asc, ${test.title}`, () => {
      const result = test.func(
        { order: 'rating', direction: 'asc' }
      )
      expect(result).eql({ property: 'rating', direction: 'asc' })
    })
  })

  it('defaults with undefined, full review list order', () => {
    const result = validateFullReviewListOrder({})
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('defaults with undefined, filtered review list order', () => {
    const result = validateFilteredReviewListOrder({})
    expect(result).eql({ property: 'beer_name', direction: 'asc' })
  })

  it('defaults with empty string, full review list order', () => {
    const result = validateFullReviewListOrder(
      { order: '', direction: '' },
    )
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('defaults with empty string, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: '', direction: '' }
    )
    expect(result).eql({ property: 'beer_name', direction: 'asc' })
  })

  it('defaults with empty string, full review list order', () => {
    const result = validateFullReviewListOrder(
      { order: '', direction: '' },
    )
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('beer_name, full review list order', () => {
    expect(
      () => validateFullReviewListOrder(
        { order: 'beer_name', direction: 'desc' }
      )
    ).to.throw(invalidReviewListQueryBeerNameError)
  })

  it('beer_name desc, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: 'beer_name', direction: 'desc' }
    )
    expect(result).eql({ property: 'beer_name', direction: 'desc' })
  })

  it('brewery_name, full review list order', () => {
    expect(
      () => validateFullReviewListOrder(
        { order: 'brewery_name', direction: 'desc' }
      )
    ).to.throw(invalidReviewListQueryBreweryNameError)
  })

  it('brewery_name asc, filtered review list order', () => {
    const result = validateFilteredReviewListOrder(
      { order: 'brewery_name', direction: 'asc' }
    )
    expect(result).eql({ property: 'brewery_name', direction: 'asc' })
  })
})
