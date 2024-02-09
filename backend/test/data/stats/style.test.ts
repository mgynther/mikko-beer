import { expect } from 'chai'

import { TestContext } from '../test-context'
import {
  type StyleStatsOrder,
  type StatsFilter
} from '../../../src/core/stats/stats'
import { type Database } from '../../../src/data/database'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import { ReviewRow } from '../../../src/data/review/review.table'
import { type InsertedData, insertMultipleReviews } from '../review-helpers'

describe('style stats tests', () => {
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
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    styleStatsOrder: StyleStatsOrder
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getStyle(
      db,
      statsFilter?.(data),
      styleStatsOrder
    )
    const style = {
      reviewAverage: avg(reviews, data.beer.beer_id),
      reviewCount: '4',
      styleId: data.style.style_id,
      styleName: data.style.name
    }
    const otherStyle = {
      reviewAverage: avg(reviews, data.otherBeer.beer_id),
      reviewCount: '5',
      styleId: data.otherStyle.style_id,
      styleName: data.otherStyle.name
    }
    return { stats, style, otherStyle }
  }

  it('by average asc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'average', direction: 'asc' }
    )
    expect(stats).eql([ style, otherStyle ])
  })

  it('by average desc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'average', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle, style ])
  })

  it('by count asc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'count', direction: 'asc' }
    )
    expect(stats).eql([ style, otherStyle ])
  })

  it('by count desc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'count', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle, style ])
  })

  it('by style_name asc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'style_name', direction: 'asc' }
    )
    expect(stats).eql([ style, otherStyle ])
  })

  it('by style_name desc', async () => {
    const { stats, style, otherStyle } = await getResults(
      ctx.db,
      undefined,
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle, style ])
  })

  it('filter by brewery', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      (data: InsertedData) => ({ brewery: data.otherBrewery.brewery_id }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle ])
  })

})
