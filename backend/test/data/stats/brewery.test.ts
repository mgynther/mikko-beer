import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Pagination } from '../../../src/core/pagination'
import type { Review } from '../../../src/core/review/review'
import type {
  BreweryStatsOrder,
  StatsFilter
} from '../../../src/core/stats/stats'
import type { Database, Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as reviewRepository from '../../../src/data/review/review.repository'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import * as styleRepository from '../../../src/data/style/style.repository'
import type { InsertedData } from '../review-helpers'
import { insertMultipleReviews } from '../review-helpers'
import { assertDeepEqual } from '../../assert'

const defaultFilter: StatsFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
  maxReviewAverage: 10,
  minReviewAverage: 4,
  maxReviewCount: Infinity,
  minReviewCount: 1
}

describe('brewery stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)


  function filterByBeer(reviews: Review[], beerId: string) {
    return reviews.filter(r => r.beer === beerId)
  }

  function avgByBeer(reviews: Review[], beerId: string) {
    return avg(filterByBeer(reviews, beerId))
  }

  function avg(reviews: Review[]) {
    const sum = reviews
      .map(r => r.rating)
      .reduce<number>((sum, rating) => sum + (rating ?? 0), 0)

    const numValue = sum / reviews.length
    return numValue.toFixed(2)
  }

  async function getResults(
    db: Database,
    pagination: Pagination,
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    breweryStatsOrder: BreweryStatsOrder
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getBrewery(
      db,
      pagination,
      statsFilter?.(data) ?? defaultFilter,
      breweryStatsOrder
    )
    const brewery = {
      reviewAverage: avgByBeer(reviews, data.beer.id),
      reviewCount: '4',
      reviewedBeerCount: '1',
      breweryId: data.brewery.id,
      breweryName: data.brewery.name
    }
    const otherBrewery = {
      reviewAverage: avgByBeer(reviews, data.otherBeer.id),
      reviewCount: '5',
      reviewedBeerCount: '1',
      breweryId: data.otherBrewery.id,
      breweryName: data.otherBrewery.name
    }
    return { stats, brewery, otherBrewery }
  }

  const allResults: Pagination = { size: 10, skip: 0 }

  it('by average asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'asc' }
    )
    assertDeepEqual(stats, [ brewery, otherBrewery ])
  })

  it('by average desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery, brewery ])
  })

  it('by count asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'asc' }
    )
    assertDeepEqual(stats, [ brewery, otherBrewery ])
  })

  it('by count desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery, brewery ])
  })

  it('by brewery_name asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'asc' }
    )
    assertDeepEqual(stats, [ otherBrewery, brewery ])
  })

  it('by brewery_name desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ brewery, otherBrewery ])
  })

  it('filter by brewery', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        brewery: data.otherBrewery.id
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery ])
  })

  it('filter by location', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        location: data.otherLocation.id
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery ])
  })

  it('filter by style', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.id
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ brewery ])
  })

  it('filter by min review count', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewCount: 5
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery ])
  })

  it('filter by max review count', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ brewery ])
  })

  it('filter by min review average', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ otherBrewery ])
  })

  it('filter by max review average', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    assertDeepEqual(stats, [ brewery ])
  })

  it('count reviewed beers', async () => {
    const reviews: Review[] = []
    const { brewery, otherBeer, otherBrewery } =
      await ctx.db.executeReadWriteTransaction(
        async (trx: Transaction
    ) => {
      const brewery =
        await breweryRepository.insertBrewery(trx, { name: 'Salama' })
      const otherBrewery =
        await breweryRepository.insertBrewery(trx, { name: 'Brewdog' })
      const style = await styleRepository.insertStyle(trx, { name: 'Helles' })
      const beer = await beerRepository.insertBeer(trx, { name: 'Brainzilla' })
      const otherBeer =
        await beerRepository.insertBeer(trx, { name: 'Lost Lager' })
      const beerBreweryRequest = {
        beer: beer.id,
        brewery: brewery.id
      }
      const otherBeerBreweryRequest = {
        beer: otherBeer.id,
        brewery: brewery.id
      }
      const otherBeerOtherBreweryRequest = {
        beer: otherBeer.id,
        brewery: otherBrewery.id
      }
      await beerRepository.insertBeerBreweries(
        trx, [beerBreweryRequest, otherBeerBreweryRequest, otherBeerOtherBreweryRequest]
      )
      const beerStyleRequest = {
        beer: beer.id,
        style: style.id,
      }
      const otherBeerStyleRequest = {
        beer: otherBeer.id,
        style: style.id,
      }
      await beerRepository.insertBeerStyles(
        trx, [beerStyleRequest, otherBeerStyleRequest]
      )
      const containerRequest = {
        size: '0.50',
        type: 'bottle'
      }
      const container =
        await containerRepository.insertContainer(trx, containerRequest)
      for (let i = 0; i < 9; i++) {
        const reviewRequest = {
          additionalInfo: '',
          beer: (i % 2 === 0) ? otherBeer.id : beer.id,
          container: container.id,
          location: '',
          rating: (i % 7) + 4,
          time: new Date(`202${
            i % 2 === 0 ? 3 : 4
          }-0${
            (i % 3) + 2
          }-0${
            (i % 5) + 1
          }T18:00:00.000Z`),
          smell: "vanilla",
          taste: "chocolate"
        }
        reviews.push(await reviewRepository.insertReview(trx, reviewRequest))
      }
      return { brewery, otherBeer, otherBrewery }
    })

    const stats = await statsRepository.getBrewery(
      ctx.db,
      allResults,
      defaultFilter,
      { property: 'brewery_name', direction: 'asc' }
    )
    const breweryStats = {
      reviewAverage: avg(reviews),
      reviewCount: `${reviews.length}`,
      reviewedBeerCount: '2',
      breweryId: brewery.id,
      breweryName: brewery.name
    }
    const otherBreweryStats = {
      reviewAverage: avgByBeer(reviews, otherBeer.id),
      reviewCount: `${filterByBeer(reviews, otherBeer.id).length}`,
      reviewedBeerCount: '1',
      breweryId: otherBrewery.id,
      breweryName: otherBrewery.name
    }
    assertDeepEqual(stats, [ otherBreweryStats, breweryStats ])
  })

})
