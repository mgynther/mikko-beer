import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import * as annualContainerStatsRepository from '../../../src/data/stats/annual-container.repository.js'
import { insertMultipleReviews } from '../review-helpers.js'
import type { Review } from '../../../src/data/review/review.repository.js'
import type { Pagination } from '../../../src/data/pagination.js'
import { assertDeepEqual } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'

const giantPage: Pagination = { size: 10000, skip: 0 }

function filterByContainer(reviews: Review[], containerId: string): Review[] {
  return reviews.filter((r) => r.container === containerId)
}

function containerYearStats(
  reviews: Review[],
  containerId: string,
  containerSize: string,
  containerType: string,
  year: string,
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
    year,
  }
}

describe('annual container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('no filters', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: undefined,
        style: undefined,
      },
    )
    const { container, otherContainer } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
      containerYearStats(reviews, otherContainer.id, '0.44', 'can', '2023'),
    ])
  })

  it('no filters with pagination size', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      { size: 1, skip: 0 },
      {
        brewery: undefined,
        location: undefined,
        style: undefined,
      },
    )
    const { container } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
    ])
  })

  it('no filters with pagination skip', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      { size: 2, skip: 1 },
      {
        brewery: undefined,
        location: undefined,
        style: undefined,
      },
    )
    const { otherContainer } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, otherContainer.id, '0.44', 'can', '2023'),
    ])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: data.brewery.id,
        location: undefined,
        style: undefined,
      },
    )
    const { container } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
    ])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: data.location.id,
        style: undefined,
      },
    )
    const { container } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
    ])
  })

  it('filter by style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: undefined,
        style: data.otherStyle.id,
      },
    )
    assertDeepEqual(stats, [
      containerYearStats(
        reviews,
        data.otherContainer.id,
        '0.44',
        'can',
        '2023',
      ),
    ])
  })
})
