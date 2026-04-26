import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Pagination } from '../../../src/core/pagination.js'
import type { Review } from '../../../src/core/review/review.js'
import type {
  LocationStatsOrder,
  StatsFilter,
} from '../../../src/core/stats/stats.js'
import type { Database } from '../../../src/data/database.js'
import * as statsRepository from '../../../src/data/stats/stats.repository.js'
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

describe('location stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function filterByBeer(reviews: Review[], beerId: string): Review[] {
    return reviews.filter((r) => r.beer === beerId)
  }

  async function getResults(
    db: Database,
    pagination: Pagination,
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    locationStatsOrder: LocationStatsOrder,
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getLocation(
      db,
      pagination,
      statsFilter?.(data) ?? defaultFilter,
      locationStatsOrder,
    )
    const locationReviews = filterByBeer(reviews, data.beer.id)
    const otherLocationReviews = filterByBeer(reviews, data.otherBeer.id)
    const location = {
      reviewAverage: avg(locationReviews),
      reviewCount: `${locationReviews.length}`,
      reviewStandardDeviation: stdDev(locationReviews),
      reviewMedian: median(locationReviews),
      reviewMode: mode(locationReviews),
      locationId: data.location.id,
      locationName: data.location.name,
    }
    const otherLocation = {
      reviewAverage: avg(otherLocationReviews),
      reviewCount: `${otherLocationReviews.length}`,
      reviewStandardDeviation: stdDev(otherLocationReviews),
      reviewMedian: median(otherLocationReviews),
      reviewMode: mode(otherLocationReviews),
      locationId: data.otherLocation.id,
      locationName: data.otherLocation.name,
    }
    return { stats, location, otherLocation }
  }

  const allResults: Pagination = { size: 10, skip: 0 }

  it('by average asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'asc' },
    )
    assertDeepEqual(stats, [location, otherLocation])
  })

  it('by average desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation, location])
  })

  it('by count asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'asc' },
    )
    assertDeepEqual(stats, [location, otherLocation])
  })

  it('by count desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation, location])
  })

  it('by location_name asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'location_name', direction: 'asc' },
    )
    assertDeepEqual(stats, [location, otherLocation])
  })

  it('by location_name desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation, location])
  })

  it('filter by brewery', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        brewery: data.brewery.id,
      }),
      { property: 'location_name', direction: 'asc' },
    )
    assertDeepEqual(stats, [location])
  })

  it('filter by location', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        location: data.otherLocation.id,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation])
  })

  it('filter by style', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.id,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [location])
  })

  it('filter by min review count', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewCount: 5,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation])
  })

  it('filter by max review count', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [location])
  })

  it('filter by min review average', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation])
  })

  it('filter by max review average', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3,
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [location])
  })

  it('filter by start time', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        timeStart: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [location])
  })

  it('filter by end time', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        timeEnd: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'location_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherLocation])
  })
})
