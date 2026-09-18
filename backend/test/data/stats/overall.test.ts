import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as overallStatsRepository from '../../../src/data/stats/overall.repository.js'

import { insertMultipleReviews } from '../review-helpers.js'
import type {
  NewReview,
  Review,
} from '../../../src/data/review/review.repository.js'
import { assertDeepEqual, assertRejects } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'
import type { Database, Transaction } from '../../../src/data/database.js'

const defaultFilter: StatsIdFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

function expectedStats(reviews: Review[]) {
  return {
    reviewAverage: avg(reviews),
    reviewCount: `${reviews.length}`,
    reviewStandardDeviation: stdDev(reviews),
    reviewMedian: median(reviews),
    reviewMode: mode(reviews),
    reviewWithLocationCount: `${
      reviews.filter((review) => review.location.length > 0).length
    }`,
    reviewWithoutLocationCount: `${
      reviews.filter((review) => review.location.length === 0).length
    }`,
  }
}

describe('overall stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function insertReviews(
    db: Database,
  ): ReturnType<typeof insertMultipleReviews> {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const newReview = await db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const reviewRequest: NewReview = {
          additionalInfo: '',
          beer: data.beer.id,
          container: data.container.id,
          location: '',
          rating: 6,
          time: new Date('2024-05-09T12:00:00.000Z'),
          smell: 'Smells funky, might be from a bad batch',
          taste: "Yes, it's not alright but still drinkable",
        }
        return await reviewRepository.insertReview(trx, reviewRequest)
      },
    )
    const allReviews = [...reviews, newReview]
    return { reviews: allReviews, data }
  }

  it('shows overall stats', async () => {
    const { reviews } = await insertReviews(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, defaultFilter)
    assertDeepEqual(stats, {
      beerCount: '2',
      breweryCount: '2',
      breweryCountryCount: '0',
      containerCount: '2',
      locationCount: '2',
      distinctBeerReviewCount: '2',
      ...expectedStats(reviews),
      styleCount: '2',
    })
  })

  it('shows overall by brewery', async () => {
    const { reviews, data } = await insertReviews(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      brewery: data.brewery.id,
    })
    const matchingReviews = reviews.filter(
      (review) => review.beer === data.beer.id,
    )
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      breweryCountryCount: '0',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      ...expectedStats(matchingReviews),
      styleCount: '1',
    })
  })

  it('counts distinct brewery countries', async () => {
    const { data } = await insertReviews(ctx.db)

    async function setCountries(country: string, otherCountry: string) {
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        await breweryRepository.updateBrewery(trx, {
          ...data.brewery,
          country,
        })
        await breweryRepository.updateBrewery(trx, {
          ...data.otherBrewery,
          country: otherCountry,
        })
      })
    }

    async function countryCounts(statsFilter: StatsIdFilter) {
      const stats = await overallStatsRepository.getOverall(ctx.db, statsFilter)
      return {
        breweryCount: stats.breweryCount,
        breweryCountryCount: stats.breweryCountryCount,
      }
    }

    await setCountries('FI', 'GB')
    assertDeepEqual(await countryCounts(defaultFilter), {
      breweryCount: '2',
      breweryCountryCount: '2',
    })
    assertDeepEqual(
      await countryCounts({ ...defaultFilter, brewery: data.brewery.id }),
      { breweryCount: '1', breweryCountryCount: '1' },
    )
    assertDeepEqual(
      await countryCounts({ ...defaultFilter, location: data.location.id }),
      { breweryCount: '1', breweryCountryCount: '1' },
    )
    assertDeepEqual(
      await countryCounts({ ...defaultFilter, style: data.otherStyle.id }),
      { breweryCount: '1', breweryCountryCount: '1' },
    )

    // Two breweries of the same country count as one country.
    await setCountries('FI', 'FI')
    assertDeepEqual(await countryCounts(defaultFilter), {
      breweryCount: '2',
      breweryCountryCount: '1',
    })

    // One country set, one left out: null is not counted.
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await breweryRepository.updateBrewery(trx, {
        ...data.otherBrewery,
        country: undefined,
      })
    })
    assertDeepEqual(await countryCounts(defaultFilter), {
      breweryCount: '2',
      breweryCountryCount: '1',
    })
  })

  it('throws on overall by multiple filters', async () => {
    const { data } = await insertMultipleReviews(9, ctx.db)
    await assertRejects(
      async () => {
        await overallStatsRepository.getOverall(ctx.db, {
          ...defaultFilter,
          brewery: data.brewery.id,
          style: data.style.id,
        })
      },
      new Error(
        'Multiple filters of brewery, location and style not supported',
      ),
      Error,
    )
  })

  it('shows overall by location', async () => {
    const { reviews, data } = await insertReviews(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      location: data.location.id,
    })
    const matchingReviews = reviews.filter(
      (review) => review.location === data.location.id,
    )
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      breweryCountryCount: '0',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      ...expectedStats(matchingReviews),
      styleCount: '1',
    })
  })

  it('shows overall by style', async () => {
    const { reviews, data } = await insertReviews(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      style: data.otherStyle.id,
    })
    const matchingReviews = reviews.filter(
      (review) => review.beer === data.otherBeer.id,
    )
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      breweryCountryCount: '0',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      ...expectedStats(matchingReviews),
      styleCount: '1',
    })
  })
})
