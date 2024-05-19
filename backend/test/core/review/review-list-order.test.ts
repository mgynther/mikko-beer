import { expect } from 'chai'

import {
  validReviewListOrder,
} from '../../../src/core/review/review'

function valid (): Record<string, unknown> {
  return { order: 'time', direction: 'desc' }
}

describe('review list order unit tests', () => {
  it('defaults with undefined', () => {
    const result = validReviewListOrder({}, 'time', 'desc')
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('defaults with empty string', () => {
    const result = validReviewListOrder(
      { order: '', direction: '' }, 'time', 'desc'
    )
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('valid test helper is valid', () => {
    const result = validReviewListOrder(valid(), 'time', 'desc')
    expect(result).not.equal(undefined)
  })

  it('invalid order value', () => {
    const result = validReviewListOrder(
      { ...valid(), order: 'testing' }, 'time', 'desc'
    )
    expect(result).equal(undefined)
  })

  it('invalid order type', () => {
    const result = validReviewListOrder(
      { ...valid(), order: 123 }, 'time', 'desc'
    )
    expect(result).equal(undefined)
  })

  it('invalid direction value', () => {
    const result = validReviewListOrder(
      { ...valid(), direction: 'testing' }, 'time', 'desc'
    )
    expect(result).equal(undefined)
  })

  it('invalid direction type', () => {
    const result = validReviewListOrder(
      { ...valid(), direction: [] }, 'time', 'desc'
    )
    expect(result).equal(undefined)
  })

  it('time desc', () => {
    const result = validReviewListOrder(
      { order: 'time', direction: 'desc' }, 'time', 'desc'
    )
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('rating asc', () => {
    const result = validReviewListOrder(
      { order: 'rating', direction: 'asc' }, 'time', 'desc'
    )
    expect(result).eql({ property: 'rating', direction: 'asc' })
  })

  it('beer_name desc', () => {
    const result = validReviewListOrder(
      { order: 'beer_name', direction: 'desc' }, 'time', 'desc'
    )
    expect(result).eql({ property: 'beer_name', direction: 'desc' })
  })

  it('brewery_name asc', () => {
    const result = validReviewListOrder(
      { order: 'brewery_name', direction: 'asc' }, 'time', 'desc'
    )
    expect(result).eql({ property: 'brewery_name', direction: 'asc' })
  })
})
