import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { BreweryStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'

suite('brewery stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface BreweryStatsData {
    brewery: CreatedOrUpdatedBrewery
    count: number
    average: string
    reviewedBeerCount: number
  }

  function checkBreweryStats(
    nokia: BreweryStatsData,
    lindemans: BreweryStatsData,
    reviewRatingsByBrewery: (id: string) => number[],
    breweryStats: BreweryStats,
  ): void {
    const nokiaRatings = reviewRatingsByBrewery(nokia.brewery.id)
    const nokiaAverage = avgRatings(nokiaRatings)
    const lindemansRatings = reviewRatingsByBrewery(lindemans.brewery.id)
    const lindemansAverage = avgRatings(lindemansRatings)
    assertDeepEqual(breweryStats, [
      {
        reviewCount: `${nokiaRatings.length}`,
        reviewAverage: nokiaAverage,
        ...distributionStats(nokiaRatings),
        reviewedBeerCount: `${nokia.reviewedBeerCount}`,
        breweryId: nokia.brewery.id,
        breweryName: nokia.brewery.name,
        breweryCountry: nokia.brewery.country,
      },
      {
        reviewCount: `${lindemansRatings.length}`,
        reviewAverage: lindemansAverage,
        ...distributionStats(lindemansRatings),
        reviewedBeerCount: `${lindemans.reviewedBeerCount}`,
        breweryId: lindemans.brewery.id,
        breweryName: lindemans.brewery.name,
        breweryCountry: lindemans.brewery.country,
      },
    ])
    assertEqual(nokiaRatings.length, nokia.count)
    assertEqual(nokiaAverage, nokia.average)
    assertEqual(lindemansRatings.length, lindemans.count)
    assertEqual(lindemansAverage, lindemans.average)
  }

  function reviewRatingsByBrewery(
    breweryId: string,
    beers: CreatedOrUpdatedBeer[],
    reviews: CreatedOrUpdatedReview[],
    filterBreweryId: string,
  ): number[] {
    return reviews
      .filter((review) => {
        const beer = beers.find((beer) => beer.id === review.beer)
        if (beer === undefined) throw new Error('must not happen')
        return (
          beer.breweries.some((brewery) => brewery === breweryId) &&
          beer.breweries.some((brewery) => brewery === filterBreweryId)
        )
      })
      .map((review) => review.rating)
  }

  test('get brewery stats', async () => {
    const { beers, breweries, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const skippedStatsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?size=30&skip=20',
      ctx.adminAuthHeaders(),
    )
    assertEqual(skippedStatsRes.status, 200)
    assertDeepEqual(skippedStatsRes.data.brewery, [])

    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?order=average&direction=desc',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const lindemansBrewery = breweries[0].data.brewery
    assertEqual(lindemansBrewery.name, 'Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    assertEqual(nokiaBrewery.name, 'Nokian Panimo')
    function filter(breweryId: string): number[] {
      return reviewRatingsByBrewery(breweryId, beers, reviews, breweryId)
    }
    checkBreweryStats(
      {
        brewery: nokiaBrewery,
        count: 3,
        reviewedBeerCount: 2,
        average: '7.33',
      },
      {
        brewery: lindemansBrewery,
        count: 3,
        reviewedBeerCount: 2,
        average: '6.67',
      },
      filter,
      statsRes.data.brewery,
    )
  })

  test('get brewery stats by brewery', async () => {
    const { beers, breweries, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const filterBreweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      `/api/v1/stats/brewery?brewery=${filterBreweryId}${order}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const lindemansBrewery = breweries[0].data.brewery
    assertEqual(lindemansBrewery.name, 'Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    assertEqual(nokiaBrewery.name, 'Nokian Panimo')
    function filter(breweryId: string): number[] {
      return reviewRatingsByBrewery(breweryId, beers, reviews, filterBreweryId)
    }
    checkBreweryStats(
      {
        brewery: nokiaBrewery,
        count: 2,
        reviewedBeerCount: 1,
        average: '7.50',
      },
      {
        brewery: lindemansBrewery,
        count: 3,
        reviewedBeerCount: 2,
        average: '6.67',
      },
      filter,
      statsRes.data.brewery,
    )
  })
})
