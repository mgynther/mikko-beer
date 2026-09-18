import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import * as annualStatsRepository from '../../../src/data/stats/annual.repository.js'
import { insertMultipleReviews } from '../review-helpers.js'
import type { Review } from '../../../src/data/review/review.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { avg, median, mode, stdDev } from './stats-helpers.js'

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

describe('annual stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('no filters', async () => {
    const { reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
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
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: undefined,
    })
    assertDeepEqual(stats, [])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: data.brewery.id,
      location: undefined,
      style: undefined,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by brewery, location & style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: data.brewery.id,
      location: data.location.id,
      style: data.style.id,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: data.location.id,
      style: undefined,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2024')])
  })

  it('filter by style', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: undefined,
      location: undefined,
      style: data.otherStyle.id,
    })
    assertDeepEqual(stats, [yearStats(reviews, '2023')])
  })
})
