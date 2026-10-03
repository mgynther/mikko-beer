import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { AnnualStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'
import { reviewsByBrewery, reviewsByYear } from './review-filters.js'

suite('annual stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface Annual {
    count: number
    average: string
  }

  function checkAnnualStats(
    reviewRatingsByYear: (year: string) => number[],
    annualStats: AnnualStats,
    expectedAnnual: Annual[],
  ): void {
    const annual = ['2023', '2022', '2021'].map((year) => {
      const ratings = reviewRatingsByYear(year)
      return {
        ratings,
        average: avgRatings(ratings),
        count: ratings.length,
        year,
      }
    })

    function stat(
      count: number,
      average: string,
      ratings: number[],
      year: string,
    ) {
      return {
        reviewCount: `${count}`,
        reviewAverage: average,
        ...distributionStats(ratings),
        year,
      }
    }

    assertDeepEqual(
      annualStats,
      annual
        .filter((a) => a.count > 0)
        .map((annual) =>
          stat(annual.count, annual.average, annual.ratings, annual.year),
        ),
    )

    assertDeepEqual(
      annual.map((annual) => ({
        average: annual.average,
        count: annual.count,
      })),
      expectedAnnual,
    )
  }

  test('get annual stats', async () => {
    const { reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      '/api/v1/stats/annual',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviews
        .filter((review: CreatedOrUpdatedReview) => {
          return review.time.startsWith(year)
        })
        .map((review: CreatedOrUpdatedReview) => review.rating)
    }
    checkAnnualStats(reviewRatingsByYear, statsRes.data.annual, [
      {
        count: 2,
        average: '7.50',
      },
      {
        count: 1,
        average: '7.00',
      },
      {
        count: 1,
        average: '5.00',
      },
    ])
  })

  test('get annual stats by brewery', async () => {
    const { beers, breweries, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      `/api/v1/stats/annual?brewery=${breweryId}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviewsByBrewery(
        reviewsByYear(reviews, year),
        beers,
        breweryId,
      ).map((review: CreatedOrUpdatedReview) => review.rating)
    }
    checkAnnualStats(reviewRatingsByYear, statsRes.data.annual, [
      {
        count: 2,
        average: '7.50',
      },
      {
        count: 0,
        average: '-',
      },
      {
        count: 1,
        average: '5.00',
      },
    ])
  })
})
