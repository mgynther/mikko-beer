import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Review } from '../../../src/core/review/review'
import {
  type StyleStatsOrder,
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

describe('style stats tests', () => {
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
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    styleStatsOrder: StyleStatsOrder
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getStyle(
      db,
      statsFilter?.(data) ?? defaultFilter,
      styleStatsOrder
    )
    const style = {
      reviewAverage: avg(reviews, data.beer.id),
      reviewCount: '4',
      styleId: data.style.style_id,
      styleName: data.style.name
    }
    const otherStyle = {
      reviewAverage: avg(reviews, data.otherBeer.id),
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
      (data: InsertedData) => ({
        ...defaultFilter,
        brewery: data.otherBrewery.id
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle ])
  })

  it('filter by style', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.style_id
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ style ])
  })

  it('filter by min review count', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        minReviewCount: 5
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle ])
  })

  it('filter by max review count', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ style ])
  })

  it('filter by min review average', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ otherStyle ])
  })

  it('filter by max review average', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3
      }),
      { property: 'style_name', direction: 'desc' }
    )
    expect(stats).eql([ style ])
  })

})
