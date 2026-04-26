import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import * as statsRepository from '../../../src/data/stats/stats.repository.js'
import { insertMultipleReviews } from '../review-helpers.js'
import type { Review } from '../../../src/core/review/review.js'
import { assertDeepEqual } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'

describe('container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function filterByContainer(reviews: Review[], containerId: string): Review[] {
    return reviews.filter((r) => r.container === containerId)
  }

  function containerStats(
    reviews: Review[],
    containerId: string,
    containerSize: string,
    containerType: string,
  ) {
    const matching = filterByContainer(reviews, containerId)
    return {
      containerId,
      containerSize,
      containerType,
      reviewAverage: avg(matching),
      reviewCount: `${matching.length}`,
      reviewStandardDeviation: stdDev(matching),
      reviewMedian: median(matching),
      reviewMode: mode(matching),
    }
  }

  it('no filters', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: undefined,
    })
    const { container, otherContainer } = data
    assertDeepEqual(stats, [
      containerStats(reviews, container.id, '0.50', 'bottle'),
      containerStats(reviews, otherContainer.id, '0.44', 'can'),
    ])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(ctx.db, {
      brewery: data.brewery.id,
      location: undefined,
      style: undefined,
    })
    const { container } = data
    assertDeepEqual(stats, [
      containerStats(reviews, container.id, '0.50', 'bottle'),
    ])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(ctx.db, {
      brewery: undefined,
      location: data.location.id,
      style: undefined,
    })
    const { container } = data
    assertDeepEqual(stats, [
      containerStats(reviews, container.id, '0.50', 'bottle'),
    ])
  })

  it('filter by style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: data.otherStyle.id,
    })
    assertDeepEqual(stats, [
      containerStats(reviews, data.otherContainer.id, '0.44', 'can'),
    ])
  })
})
