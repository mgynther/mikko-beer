import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import * as statsRepository from '../../../src/data/stats/stats.repository.js'
import { insertMultipleReviews } from '../review-helpers.js'
import type { Review } from '../../../src/core/review/review.js'
import type { Pagination } from '../../../src/core/pagination.js'
import { assertDeepEqual } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'

const giantPage: Pagination = { size: 10000, skip: 0 }

function filterByContainer(reviews: Review[], containerId: string): Review[] {
  return reviews.filter((r) => r.container === containerId)
}

function filterByYear(reviews: Review[], year: string): Review[] {
  return reviews.filter((r) => `${new Date(r.time).getUTCFullYear()}` === year)
}

function yearStats(reviews: Review[], year: string) {
  const matching = filterByYear(reviews, year)
  return {
    reviewAverage: avg(matching),
    reviewCount: `${matching.length}`,
    reviewStandardDeviation: stdDev(matching),
    reviewMedian: median(matching),
    reviewMode: mode(matching),
    year,
  }
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

describe('annual stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('no filters', async () => {
    const { reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: undefined,
    })
    assertDeepEqual(stats, [
      yearStats(reviews, '2024'),
      yearStats(reviews, '2023'),
    ])
  })

  it('no filters & no reviews', async () => {
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: undefined,
    })
    assertDeepEqual(stats, [])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: data.brewery.id,
      location: undefined,
      style: undefined,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by brewery, location & style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: data.brewery.id,
      location: data.location.id,
      style: data.style.id,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: data.location.id,
      style: undefined,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: data.otherStyle.id,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2023')])
  })
})

describe('annual container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('no filters', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(ctx.db, giantPage, {
      brewery: undefined,
      location: undefined,
      style: undefined,
    })
    const { container, otherContainer } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
      containerYearStats(reviews, otherContainer.id, '0.44', 'can', '2023'),
    ])
  })

  it('no filters with pagination size', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(
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
    const stats = await statsRepository.getAnnualContainer(
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
    const stats = await statsRepository.getAnnualContainer(ctx.db, giantPage, {
      brewery: data.brewery.id,
      location: undefined,
      style: undefined,
    })
    const { container } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
    ])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(ctx.db, giantPage, {
      brewery: undefined,
      location: data.location.id,
      style: undefined,
    })
    const { container } = data
    assertDeepEqual(stats, [
      containerYearStats(reviews, container.id, '0.50', 'bottle', '2024'),
    ])
  })

  it('filter by style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(ctx.db, giantPage, {
      brewery: undefined,
      location: undefined,
      style: data.otherStyle.id,
    })
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
