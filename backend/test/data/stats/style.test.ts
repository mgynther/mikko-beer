import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Review } from '../../../src/core/review/review.js'
import type {
  StyleStatsOrder,
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

describe('style stats tests', () => {
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
    statsFilter: ((data: InsertedData) => StatsFilter) | undefined,
    styleStatsOrder: StyleStatsOrder,
  ) {
    const { reviews, data } = await insertMultipleReviews(9, db)
    const stats = await statsRepository.getStyle(
      db,
      statsFilter?.(data) ?? defaultFilter,
      styleStatsOrder,
    )
    const styleReviews = filterByBeer(reviews, data.beer.id)
    const otherStyleReviews = filterByBeer(reviews, data.otherBeer.id)
    const style = {
      reviewAverage: avg(styleReviews),
      reviewCount: `${styleReviews.length}`,
      reviewStandardDeviation: stdDev(styleReviews),
      reviewMedian: median(styleReviews),
      reviewMode: mode(styleReviews),
      styleId: data.style.id,
      styleName: data.style.name,
    }
    const otherStyle = {
      reviewAverage: avg(otherStyleReviews),
      reviewCount: `${otherStyleReviews.length}`,
      reviewStandardDeviation: stdDev(otherStyleReviews),
      reviewMedian: median(otherStyleReviews),
      reviewMode: mode(otherStyleReviews),
      styleId: data.otherStyle.id,
      styleName: data.otherStyle.name,
    }
    return { stats, style, otherStyle }
  }

  it('by average asc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'average',
      direction: 'asc',
    })
    assertDeepEqual(stats, [style, otherStyle])
  })

  it('by average desc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'average',
      direction: 'desc',
    })
    assertDeepEqual(stats, [otherStyle, style])
  })

  it('by count asc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'count',
      direction: 'asc',
    })
    assertDeepEqual(stats, [style, otherStyle])
  })

  it('by count desc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'count',
      direction: 'desc',
    })
    assertDeepEqual(stats, [otherStyle, style])
  })

  it('by style_name asc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'style_name',
      direction: 'asc',
    })
    assertDeepEqual(stats, [style, otherStyle])
  })

  it('by style_name desc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'style_name',
      direction: 'desc',
    })
    assertDeepEqual(stats, [otherStyle, style])
  })

  it('by std_dev asc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'std_dev',
      direction: 'asc',
    })
    assertDeepEqual(stats, [style, otherStyle])
  })

  it('by std_dev desc', async () => {
    const { stats, style, otherStyle } = await getResults(ctx.db, undefined, {
      property: 'std_dev',
      direction: 'desc',
    })
    assertDeepEqual(stats, [otherStyle, style])
  })

  it('filter by brewery', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      (data: InsertedData) => ({
        ...defaultFilter,
        brewery: data.otherBrewery.id,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherStyle])
  })

  it('filter by location', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      (data: InsertedData) => ({
        ...defaultFilter,
        location: data.otherLocation.id,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherStyle])
  })

  it('filter by style', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      (data: InsertedData) => ({
        ...defaultFilter,
        style: data.style.id,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [style])
  })

  it('filter by min review count', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        minReviewCount: 5,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherStyle])
  })

  it('filter by max review count', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        maxReviewCount: 4,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [style])
  })

  it('filter by min review average', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        minReviewAverage: 6.3,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherStyle])
  })

  it('filter by max review average', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        maxReviewAverage: 6.3,
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [style])
  })

  it('filter by start time', async () => {
    const { stats, style } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        timeStart: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [style])
  })

  it('filter by end time', async () => {
    const { stats, otherStyle } = await getResults(
      ctx.db,
      () => ({
        ...defaultFilter,
        timeEnd: new Date('2024-01-01T00:00:00.000Z'),
      }),
      { property: 'style_name', direction: 'desc' },
    )
    assertDeepEqual(stats, [otherStyle])
  })
})
