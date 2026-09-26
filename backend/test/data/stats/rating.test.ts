import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as ratingStatsRepository from '../../../src/data/stats/rating.repository.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'

const noFilter: StatsIdFilter = {
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
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer())
      const container = await containerRepository.insertContainer(
        trx,
        buildNewContainer(),
      )
      const location = await locationRepository.insertLocation(
        trx,
        buildNewLocation(),
      )
      // Out of order and with a gap, so that the stats list only the
      // ratings given, in ascending order.
      await Promise.all(
        [8, 5, 10, 8].map((rating) =>
          reviewRepository.insertReview(
            trx,
            buildNewReview({
              beer: beer.id,
              container: container.id,
              location: location.id,
              rating,
            }),
          ),
        ),
      )
    })

    const stats = await ratingStatsRepository.getRating(ctx.db, noFilter)

    assertDeepEqual(stats, [
      { rating: '5', count: '1' },
      { rating: '8', count: '2' },
      { rating: '10', count: '1' },
    ])
  })
})
