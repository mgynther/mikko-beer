import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as ratingStatsRepository from '../../../src/data/stats/rating.repository.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'

const noFilter: StatsIdFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

suite('rating stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('shows rating stats', async () => {
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const [beer, container, location] = await Promise.all([
        beerRepository.insertBeer(trx, buildNewBeer()),
        containerRepository.insertContainer(trx, buildNewContainer()),
        locationRepository.insertLocation(trx, buildNewLocation()),
      ])
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

  test('filters rating stats by brewery', async () => {
    const lindemans = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [lindemans, nokian, kriek, ipa, container, location] =
          await Promise.all([
            breweryRepository.insertBrewery(
              trx,
              buildNewBrewery({ name: 'Lindemans' }),
            ),
            breweryRepository.insertBrewery(
              trx,
              buildNewBrewery({ name: 'Nokian Panimo' }),
            ),
            beerRepository.insertBeer(trx, buildNewBeer({ name: 'Kriek' })),
            beerRepository.insertBeer(trx, buildNewBeer({ name: 'IPA' })),
            containerRepository.insertContainer(trx, buildNewContainer()),
            locationRepository.insertLocation(trx, buildNewLocation()),
          ])
        await beerRepository.insertBeerBreweries(trx, [
          { beer: kriek.id, brewery: lindemans.id },
          { beer: ipa.id, brewery: nokian.id },
        ])
        await Promise.all(
          [
            { beer: kriek, rating: 8 },
            { beer: ipa, rating: 6 },
          ].map(({ beer, rating }) =>
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
        return lindemans
      },
    )

    const stats = await ratingStatsRepository.getRating(ctx.db, {
      ...noFilter,
      brewery: lindemans.id,
    })

    assertDeepEqual(stats, [{ rating: '8', count: '1' }])
  })
})
