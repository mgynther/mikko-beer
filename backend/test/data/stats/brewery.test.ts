import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Pagination } from '../../../src/core/pagination.js'
import type { NewReview, Review } from '../../../src/core/review/review.js'
import type {
  BreweryStatsOrder,
  StatsFilter,
} from '../../../src/core/stats/stats.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as statsRepository from '../../../src/data/stats/stats.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import type { InsertedData } from '../review-helpers.js'
import { insertMultipleReviews } from '../review-helpers.js'
import { assertDeepEqual } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'

const defaultFilter: StatsFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
  maxReviewAverage: 10,
  minReviewAverage: 4,
  maxReviewCount: Infinity,
  minReviewCount: 1,
  timeStart: undefined,
  timeEnd: undefined,
}

function filterByBeer(reviews: Review[], beerId: string): Review[] {
  return reviews.filter((r) => r.beer === beerId)
}

describe('brewery stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function getResults(
    db: Database,
    pagination: Pagination,
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    breweryStatsOrder: BreweryStatsOrder,
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getBrewery(
      db,
      pagination,
      statsFilter?.(data) ?? defaultFilter,
      breweryStatsOrder,
    )
    const breweryReviews = filterByBeer(reviews, data.beer.id)
    const otherBreweryReviews = filterByBeer(reviews, data.otherBeer.id)
    const brewery = {
      reviewAverage: avg(breweryReviews),
      reviewCount: `${breweryReviews.length}`,
      reviewStandardDeviation: stdDev(breweryReviews),
      reviewMedian: median(breweryReviews),
      reviewMode: mode(breweryReviews),
      reviewedBeerCount: '1',
      breweryId: data.brewery.id,
      breweryName: data.brewery.name,
    }
    const otherBrewery = {
      reviewAverage: avg(otherBreweryReviews),
      reviewCount: `${otherBreweryReviews.length}`,
      reviewStandardDeviation: stdDev(otherBreweryReviews),
      reviewMedian: median(otherBreweryReviews),
      reviewMode: mode(otherBreweryReviews),
      reviewedBeerCount: '1',
      breweryId: data.otherBrewery.id,
      breweryName: data.otherBrewery.name,
    }
    return { stats, brewery, otherBrewery }
  }

  const allResults: Pagination = { size: 10, skip: 0 }

  it('by average asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'asc' },
    )
    assertDeepEqual(stats, [brewery, otherBrewery])
  })

  it('by average desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery, brewery])
  })

  it('by count asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'asc' },
    )
    assertDeepEqual(stats, [brewery, otherBrewery])
  })

  it('by count desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery, brewery])
  })

  it('by brewery_name asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'asc' },
    )
    assertDeepEqual(stats, [otherBrewery, brewery])
  })

  it('by brewery_name desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [brewery, otherBrewery])
  })

  it('filter by brewery', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        brewery: data.otherBrewery.id,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery])
  })

  it('filter by location', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        location: data.otherLocation.id,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery])
  })

  it('filter by style', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.id,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [brewery])
  })

  it('filter by min review count', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewCount: 5,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery])
  })

  it('filter by max review count', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [brewery])
  })

  it('filter by min review average', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery])
  })

  it('filter by max review average', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3,
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [brewery])
  })

  it('filter by start time', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        timeStart: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [brewery])
  })

  it('filter by end time', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        timeEnd: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'brewery_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherBrewery])
  })

  it('count reviewed beers', async () => {
    const reviews: Review[] = []
    const { brewery, otherBeer, otherBrewery } =
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        const brewery = await breweryRepository.insertBrewery(trx, {
          name: 'Salama',
        })
        const otherBrewery = await breweryRepository.insertBrewery(trx, {
          name: 'Brewdog',
        })
        const style = await styleRepository.insertStyle(trx, { name: 'Helles' })
        const beer = await beerRepository.insertBeer(trx, {
          name: 'Brainzilla',
        })
        const otherBeer = await beerRepository.insertBeer(trx, {
          name: 'Lost Lager',
        })
        const beerBreweryRequest = {
          beer: beer.id,
          brewery: brewery.id,
        }
        const otherBeerBreweryRequest = {
          beer: otherBeer.id,
          brewery: brewery.id,
        }
        const otherBeerOtherBreweryRequest = {
          beer: otherBeer.id,
          brewery: otherBrewery.id,
        }
        await beerRepository.insertBeerBreweries(trx, [
          beerBreweryRequest,
          otherBeerBreweryRequest,
          otherBeerOtherBreweryRequest,
        ])
        const beerStyleRequest = {
          beer: beer.id,
          style: style.id,
        }
        const otherBeerStyleRequest = {
          beer: otherBeer.id,
          style: style.id,
        }
        await beerRepository.insertBeerStyles(trx, [
          beerStyleRequest,
          otherBeerStyleRequest,
        ])
        const containerRequest = {
          size: '0.50',
          type: 'bottle',
        }
        const container = await containerRepository.insertContainer(
          trx,
          containerRequest,
        )
        const indices: Array<number> = Array.from(Array(9).keys())
        const newReviews: NewReview[] = indices.map((i) => {
          const reviewRequest: NewReview = {
            additionalInfo: '',
            beer: i % 2 === 0 ? otherBeer.id : beer.id,
            container: container.id,
            location: '',
            rating: (i % 7) + 4,
            time: new Date(
              `202${i % 2 === 0 ? 3 : 4}-0${(i % 3) + 2}-0${
                (i % 5) + 1
              }T18:00:00.000Z`,
            ),
            smell: 'vanilla',
            taste: 'chocolate',
          }
          return reviewRequest
        })
        const requests = newReviews.map((reviewRequest) =>
          reviewRepository.insertReview(trx, reviewRequest),
        )
        const createdReviews = await Promise.all(requests)
        createdReviews.forEach((review) => reviews.push(review))
        return { brewery, otherBeer, otherBrewery }
      })

    const stats = await statsRepository.getBrewery(
      ctx.db,
      allResults,
      defaultFilter,
      { property: 'brewery_name', direction: 'asc' },
    )
    const otherBeerReviews = filterByBeer(reviews, otherBeer.id)
    const breweryStats = {
      reviewAverage: avg(reviews),
      reviewCount: `${reviews.length}`,
      reviewStandardDeviation: stdDev(reviews),
      reviewMedian: median(reviews),
      reviewMode: mode(reviews),
      reviewedBeerCount: '2',
      breweryId: brewery.id,
      breweryName: brewery.name,
    }
    const otherBreweryStats = {
      reviewAverage: avg(otherBeerReviews),
      reviewCount: `${otherBeerReviews.length}`,
      reviewStandardDeviation: stdDev(otherBeerReviews),
      reviewMedian: median(otherBeerReviews),
      reviewMode: mode(otherBeerReviews),
      reviewedBeerCount: '1',
      breweryId: otherBrewery.id,
      breweryName: otherBrewery.name,
    }
    assertDeepEqual(stats, [otherBreweryStats, breweryStats])
  })
})
