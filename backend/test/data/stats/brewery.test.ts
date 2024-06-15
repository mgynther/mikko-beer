import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type Pagination } from '../../../src/core/pagination'
import { type Review } from '../../../src/core/review/review'
import {
  type BreweryStatsOrder,
  type StatsFilter
} from '../../../src/core/stats/stats'
import { type Database } from '../../../src/data/database'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import { type InsertedData, insertMultipleReviews } from '../review-helpers'

const defaultFilter: StatsFilter = {
  brewery: undefined,
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
      reviewAverage: avg(reviews, data.beer.id),
      reviewCount: '4',
      breweryId: data.brewery.id,
      breweryName: data.brewery.name
    }
    const otherBrewery = {
      reviewAverage: avg(reviews, data.otherBeer.id),
      reviewCount: '5',
      breweryId: data.otherBrewery.id,
      breweryName: data.otherBrewery.name
    }
    const style = {
      reviewAverage: avg(reviews, data.style.style_id),
      reviewCount: '4',
      styleId: data.style.style_id,
      styleName: data.style.name
    }
    return { stats, brewery, otherBrewery, style }
  }

  const allResults: Pagination = { size: 10, skip: 0 }

  it('by average asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'asc' }
    )
    expect(stats).eql([ brewery, otherBrewery ])
  })

  it('by average desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'average', direction: 'desc' }
    )
    expect(stats).eql([ otherBrewery, brewery ])
  })

  it('by count asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'asc' }
    )
    expect(stats).eql([ brewery, otherBrewery ])
  })

  it('by count desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'count', direction: 'desc' }
    )
    expect(stats).eql([ otherBrewery, brewery ])
  })

  it('by brewery_name asc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'asc' }
    )
    expect(stats).eql([ otherBrewery, brewery ])
  })

  it('by brewery_name desc', async () => {
    const { stats, brewery, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      undefined,
      { property: 'brewery_name', direction: 'desc' }
    )
    expect(stats).eql([ brewery, otherBrewery ])
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
    expect(stats).eql([ otherBrewery ])
  })

  it('filter by style', async () => {
    const { stats, brewery } = await getResults(
      ctx.db,
      allResults,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.style_id
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    expect(stats).eql([ brewery ])
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
    expect(stats).eql([ otherBrewery ])
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
    expect(stats).eql([ brewery ])
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
    expect(stats).eql([ otherBrewery ])
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
    expect(stats).eql([ brewery ])
  })

})
