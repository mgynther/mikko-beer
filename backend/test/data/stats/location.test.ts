import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { Pagination } from '../../../src/core/pagination'
import type { Review } from '../../../src/core/review/review'
import type {
  LocationStatsOrder,
  StatsFilter
} from '../../../src/core/stats/stats'
import type { Database } from '../../../src/data/database'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import type { InsertedData } from '../review-helpers'
import { insertMultipleReviews } from '../review-helpers'

const defaultFilter: StatsFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
  maxReviewAverage: 10,
  minReviewAverage: 4,
  maxReviewCount: Infinity,
  minReviewCount: 1
}

describe('location stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function avg(reviews: Review[], beerId: string) {
    if (reviews === null) throw new Error('must not be null')
    const filteredReviews = reviews
      .filter(r => r.beer === beerId)
    const sum = filteredReviews
      .map(r => r.rating)
      .reduce<number>((sum, rating) => sum + (rating ?? 0), 0)

    const numValue = sum / filteredReviews.length
    return numValue.toFixed(2)
  }

  async function getResults(
    db: Database,
    pagination: Pagination,
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    locationStatsOrder: LocationStatsOrder
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getLocation(
      db,
      pagination,
      statsFilter?.(data) ?? defaultFilter,
      locationStatsOrder
    )
    const location = {
      reviewAverage: avg(reviews, data.beer.id),
      reviewCount: '4',
      locationId: data.location.id,
      locationName: data.location.name
    }
    const otherLocation = {
      reviewAverage: avg(reviews, data.otherBeer.id),
      reviewCount: '5',
      locationId: data.otherLocation.id,
      locationName: data.otherLocation.name
    }
    const style = {
      reviewAverage: avg(reviews, data.style.id),
      reviewCount: '4',
      styleId: data.style.id,
      styleName: data.style.name
    }
    return { stats, location, otherLocation, style }
  }

  const allResults: Pagination = { size: 10, skip: 0 }

  it('by average asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'asc' }
    )
    expect(stats).toEqual([ location, otherLocation ])
  })

  it('by average desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation, location ])
  })

  it('by count asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'asc' }
    )
    expect(stats).toEqual([ location, otherLocation ])
  })

  it('by count desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation, location ])
  })

  it('by location_name asc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'location_name', direction: 'asc' }
    )
    expect(stats).toEqual([ location, otherLocation ])
  })

  it('by location_name desc', async () => {
    const { stats, location, otherLocation } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation, location ])
  })

  it('filter by location', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        location: data.otherLocation.id
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation ])
  })

  it('filter by style', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.id
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ location ])
  })

  it('filter by min review count', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewCount: 5
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation ])
  })

  it('filter by max review count', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ location ])
  })

  it('filter by min review average', async () => {
    const { stats, otherLocation } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ otherLocation ])
  })

  it('filter by max review average', async () => {
    const { stats, location } = await getResults(
      ctx.db,
      allResults,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3
      }),
      { property: 'location_name', direction: 'desc' }
    )
    expect(stats).toEqual([ location ])
  })

})
