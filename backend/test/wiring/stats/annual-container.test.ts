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
import type { AnnualContainerStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'
import { reviewsByBrewery, reviewsByYear } from './review-filters.js'

suite('annual container stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get annual container stats', async () => {
    const { containers, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>('/api/v1/stats/annual_container', ctx.adminAuthHeaders())
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string) {
      return reviewsByYear(reviews, year).map(
        (review: CreatedOrUpdatedReview) => review.rating,
      )
    }
    const container = containers[0].data.container
    const years = ['2023', '2022', '2021']
    assertDeepEqual(
      statsRes.data.annualContainer,
      years.map((year) => {
        const ratings = reviewRatingsByYear(year)
        return {
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          reviewAverage: `${avgRatings(ratings)}`,
          reviewCount: `${ratings.length}`,
          ...distributionStats(ratings),
          year,
        }
      }),
    )
  })

  test('get annual container stats with pagination', async () => {
    const { containers, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>('/api/v1/stats/annual_container?size=1&skip=1', ctx.adminAuthHeaders())
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string) {
      return reviewsByYear(reviews, year).map(
        (review: CreatedOrUpdatedReview) => review.rating,
      )
    }
    const container = containers[0].data.container
    const years = ['2022']
    assertDeepEqual(
      statsRes.data.annualContainer,
      years.map((year) => {
        const ratings = reviewRatingsByYear(year)
        return {
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          reviewAverage: `${avgRatings(ratings)}`,
          reviewCount: `${ratings.length}`,
          ...distributionStats(ratings),
          year,
        }
      }),
    )
  })

  test('get annual container stats by brewery', async () => {
    const { beers, breweries, containers, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )
    const brewery = breweries[0].data.brewery

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>(
      `/api/v1/stats/annual_container?brewery=${brewery.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviewsByBrewery(
        reviewsByYear(reviews, year),
        beers,
        brewery.id,
      ).map((review: CreatedOrUpdatedReview) => review.rating)
    }
    const container = containers[0].data.container
    const years = ['2023', '2022', '2021']
    assertDeepEqual(
      statsRes.data.annualContainer,
      years
        .map((year) => {
          const ratings = reviewRatingsByYear(year)
          return {
            containerId: container.id,
            containerSize: container.size,
            containerType: container.type,
            reviewAverage: `${avgRatings(ratings)}`,
            reviewCount: `${ratings.length}`,
            ...distributionStats(ratings),
            year,
          }
        })
        .filter((stats) => stats.reviewCount !== '0'),
    )
  })
})
