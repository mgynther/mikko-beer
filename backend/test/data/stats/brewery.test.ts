import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type Pagination } from '../../../src/core/pagination'
import {
  type BreweryStatsOrder,
  type StatsFilter
} from '../../../src/core/stats/stats'
import { type Database } from '../../../src/data/database'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import { ReviewRow } from '../../../src/data/review/review.table'
import { type InsertedData, insertMultipleReviews } from '../review-helpers'

describe('brewery stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function avg(reviews: ReviewRow[], beerId: string) {
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
      statsFilter?.(data) ?? { brewery: undefined, minReviewCount: 1 },
      breweryStatsOrder
    )
    const brewery = {
      reviewAverage: avg(reviews, data.beer.beer_id),
      reviewCount: '4',
      breweryId: data.brewery.brewery_id,
      breweryName: data.brewery.name
    }
    const otherBrewery = {
      reviewAverage: avg(reviews, data.otherBeer.beer_id),
      reviewCount: '5',
      breweryId: data.otherBrewery.brewery_id,
      breweryName: data.otherBrewery.name
    }
    return { stats, brewery, otherBrewery }
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
        brewery: data.otherBrewery.brewery_id,
        minReviewCount: 1
      }),
      { property: 'brewery_name', direction: 'desc' }
    )
    expect(stats).eql([ otherBrewery ])
  })

  it('filter by review count', async () => {
    const { stats, otherBrewery } = await getResults(
      ctx.db,
      allResults,
      () => ({ brewery: undefined, minReviewCount: 5 }),
      { property: 'brewery_name', direction: 'desc' }
    )
    expect(stats).eql([ otherBrewery ])
  })

})
