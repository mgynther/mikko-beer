import { expect } from 'chai'

import {
  validReviewListOrder,
} from '../../../src/core/review/review'

function valid (): Record<string, unknown> {
  return { order: 'time', direction: 'desc' }
}

describe('review list order unit tests', () => {
  it('defaults with undefined', () => {
    const result = validReviewListOrder({})
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('defaults with empty string', () => {
    const result = validReviewListOrder({ order: '', direction: '' })
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('valid test helper is valid', () => {
    const result = validReviewListOrder(valid())
    expect(result).not.equal(undefined)
  })

  it('invalid order value', () => {
    const result = validReviewListOrder({ ...valid(), order: 'testing' })
    expect(result).equal(undefined)
  })

  it('invalid order type', () => {
    const result = validReviewListOrder({ ...valid(), order: 123 })
    expect(result).equal(undefined)
  })

  it('invalid direction value', () => {
    const result = validReviewListOrder({ ...valid(), direction: 'testing' })
    expect(result).equal(undefined)
  })

  it('invalid direction type', () => {
    const result = validReviewListOrder({ ...valid(), direction: [] })
    expect(result).equal(undefined)
  })

  it('time desc', () => {
    const result = validReviewListOrder({ order: 'time', direction: 'desc' })
    expect(result).eql({ property: 'time', direction: 'desc' })
  })

  it('rating asc', () => {
    const result = validReviewListOrder({ order: 'rating', direction: 'asc' })
    expect(result).eql({ property: 'rating', direction: 'asc' })
  })
})
