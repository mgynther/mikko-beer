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
import type { CreatedOrUpdatedLocation } from '../../../src/web/location/location.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { LocationStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'

suite('location stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface LocationStatsData {
    location: CreatedOrUpdatedLocation
    count: number
    average: string
  }

  function checkLocationStats(
    kuja: LocationStatsData,
    oluthuone: LocationStatsData,
    reviewRatingsByLocation: (id: string) => number[],
    locationStats: LocationStats,
  ): void {
    const kujaRatings = reviewRatingsByLocation(kuja.location.id)
    const kujaAverage = avgRatings(kujaRatings)
    const oluthuoneRatings = reviewRatingsByLocation(oluthuone.location.id)
    const oluthuoneAverage = avgRatings(oluthuoneRatings)
    assertDeepEqual(locationStats, [
      {
        reviewCount: `${kujaRatings.length}`,
        reviewAverage: kujaAverage,
        ...distributionStats(kujaRatings),
        locationId: kuja.location.id,
        locationName: kuja.location.name,
      },
      {
        reviewCount: `${oluthuoneRatings.length}`,
        reviewAverage: oluthuoneAverage,
        ...distributionStats(oluthuoneRatings),
        locationId: oluthuone.location.id,
        locationName: oluthuone.location.name,
      },
    ])
    assertEqual(kujaRatings.length, kuja.count)
    assertEqual(kujaAverage, kuja.average)
    assertEqual(oluthuoneRatings.length, oluthuone.count)
    assertEqual(oluthuoneAverage, oluthuone.average)
  }

  function reviewRatingsByLocation(
    locationId: string,
    beers: CreatedOrUpdatedBeer[],
    reviews: CreatedOrUpdatedReview[],
    filterBreweryId: string | undefined,
  ): number[] {
    return reviews
      .filter((review) => {
        if (review.location !== locationId) {
          return false
        }
        const beer = beers.find((beer) => beer.id === review.beer)
        if (beer === undefined) throw new Error('must not happen')
        return beer.breweries.some(
          (brewery) =>
            filterBreweryId === undefined || brewery === filterBreweryId,
        )
      })
      .map((review) => review.rating)
  }

  test('get location stats', async () => {
    const { beers, locations, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const skippedStatsRes = await ctx.request.get<{ location: LocationStats }>(
      '/api/v1/stats/location?size=30&skip=20',
      ctx.adminAuthHeaders(),
    )
    assertEqual(skippedStatsRes.status, 200)
    assertDeepEqual(skippedStatsRes.data.location, [])

    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      '/api/v1/stats/location?order=average&direction=asc',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const oluthuoneLocation = locations[1].data.location
    assertEqual(oluthuoneLocation.name, 'Oluthuone')
    function filter(locationId: string): number[] {
      return reviewRatingsByLocation(locationId, beers, reviews, undefined)
    }
    checkLocationStats(
      { location: kujaLocation, count: 2, average: '6.50' },
      { location: oluthuoneLocation, count: 2, average: '7.00' },
      filter,
      statsRes.data.location,
    )
  })

  test('get location stats by brewery', async () => {
    const { beers, breweries, locations, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const filterBreweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=desc'
    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      `/api/v1/stats/location?brewery=${filterBreweryId}${order}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const oluthuoneLocation = locations[1].data.location
    assertEqual(oluthuoneLocation.name, 'Oluthuone')
    function filter(locationId: string): number[] {
      return reviewRatingsByLocation(
        locationId,
        beers,
        reviews,
        filterBreweryId,
      )
    }
    checkLocationStats(
      { location: kujaLocation, count: 2, average: '6.50' },
      { location: oluthuoneLocation, count: 1, average: '7.00' },
      filter,
      statsRes.data.location,
    )
  })

  test('get location stats by location', async () => {
    const { beers, locations, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const order = '&order=count&direction=desc'
    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      `/api/v1/stats/location?location=${kujaLocation.id}${order}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kujaRatings = reviewRatingsByLocation(
      kujaLocation.id,
      beers,
      reviews,
      undefined,
    )
    const kujaAverage = avgRatings(kujaRatings)
    assertDeepEqual(statsRes.data.location, [
      {
        reviewCount: `${kujaRatings.length}`,
        reviewAverage: kujaAverage,
        ...distributionStats(kujaRatings),
        locationId: kujaLocation.id,
        locationName: kujaLocation.name,
      },
    ])
    assertEqual(kujaRatings.length, 2)
    assertEqual(kujaAverage, '6.50')
  })
})
