import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { RatingStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'

suite('rating stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  type TestRatingStats = Array<{ rating: number; count: number }>

  function checkRatingStats(
    stats: TestRatingStats,
    actualStats: RatingStats,
    expectedStats: RatingStats,
  ): void {
    stats.sort((a, b) => a.rating - b.rating)
    const convertedStats = stats.map((s) => ({
      rating: `${s.rating}`,
      count: `${s.count}`,
    }))
    assertDeepEqual(actualStats, convertedStats)
    assertDeepEqual(actualStats, expectedStats)
  }

  test('get rating stats', async () => {
    const { reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      '/api/v1/stats/rating',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const stats = reviews.reduce((ratingStats: TestRatingStats, review) => {
      const rating = review.rating
      const existing = ratingStats.find((r) => r.rating === rating)
      if (existing === undefined) {
        ratingStats.push({ rating, count: 1 })
        return ratingStats
      }
      existing.count++
      return ratingStats
    }, [])
    const expectedStats = [
      { rating: '5', count: '1' },
      { rating: '7', count: '2' },
      { rating: '8', count: '1' },
    ]
    checkRatingStats(stats, statsRes.data.rating, expectedStats)
  })

  test('get rating stats by brewery', async () => {
    const { beers, breweries, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      `/api/v1/stats/rating?brewery=${breweryId}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const stats = reviews.reduce(
      (
        ratingStats: Array<{
          rating: number
          count: number
        }>,
        review,
      ) => {
        const beerId = review.beer
        const beerRes = beers.find((beer) => beer.id === beerId)
        if (beerRes === undefined) {
          return ratingStats
        }
        if (!beerRes.breweries.includes(breweryId)) {
          return ratingStats
        }
        const rating = review.rating
        const existing = ratingStats.find((r) => r.rating === rating)
        if (existing === undefined) {
          ratingStats.push({ rating, count: 1 })
          return ratingStats
        }
        existing.count++
        return ratingStats
      },
      [],
    )
    const expectedStats = [
      { rating: '5', count: '1' },
      { rating: '7', count: '1' },
      { rating: '8', count: '1' },
    ]
    checkRatingStats(stats, statsRes.data.rating, expectedStats)
  })
})
