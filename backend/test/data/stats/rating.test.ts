import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { StatsIdFilter } from '../../../src/core/stats/stats.js'
import * as statsRepository from '../../../src/data/stats/stats.repository.js'

import { insertMultipleReviews } from '../review-helpers.js'
import { assertDeepEqual } from '../../assert.js'

const defaultFilter: StatsIdFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

describe('rating stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('shows rating stats', async () => {
    const { reviews } = await insertMultipleReviews(9, ctx.db)

    const stats = await statsRepository.getRating(ctx.db, defaultFilter)
    function getCount(rating: string): string {
      const count = reviews.filter(
        (review) => `${review.rating}` === rating,
      ).length
      return `${count}`
    }
    assertDeepEqual(stats, [
      {
        count: getCount('4'),
        rating: '4',
      },
      {
        count: getCount('5'),
        rating: '5',
      },
      {
        count: getCount('6'),
        rating: '6',
      },
      {
        count: getCount('7'),
        rating: '7',
      },
      {
        count: getCount('8'),
        rating: '8',
      },
      {
        count: getCount('9'),
        rating: '9',
      },
      {
        count: getCount('10'),
        rating: '10',
      },
    ])
  })
})
