import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { StatsIdFilter } from '../../../src/core/stats/stats'
import * as statsRepository from '../../../src/data/stats/stats.repository'

import { insertMultipleReviews } from '../review-helpers'
import type { Review } from '../../../src/core/review/review'
import { assertDeepEqual } from '../../assert'

const defaultFilter: StatsIdFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined
}

function reviewAverage(reviews: Review[]): string {
  return (
    reviews
      .map(r => r.rating)
      .reduce((sum, rating) => sum + rating, 0)
      / reviews.length
  ).toFixed(2)
}

describe('overall stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('shows overall stats', async () => {
    const { reviews } = await insertMultipleReviews(9, ctx.db)

    const stats = await statsRepository.getOverall(ctx.db, defaultFilter)
    assertDeepEqual(stats, {
      beerCount: '2',
      breweryCount: '2',
      containerCount: '2',
      locationCount: '2',
      distinctBeerReviewCount: '2',
      reviewAverage: reviewAverage(reviews),
      reviewCount: `${reviews.length}`,
      styleCount: '2'
    })
  })

  it('shows overall by brewery', async () => {
    const { reviews, data } = await insertMultipleReviews(9, ctx.db)

    const stats = await statsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      brewery: data.brewery.id
    })
    const matchingReviews = reviews.filter((_, index) => index % 2 === 1)
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      reviewAverage: reviewAverage(matchingReviews),
      reviewCount: `${matchingReviews.length}`,
      styleCount: '1'
    })
  })

  it('shows overall by location', async () => {
    const { reviews, data } = await insertMultipleReviews(9, ctx.db)

    const stats = await statsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      location: data.location.id
    })
    const matchingReviews = reviews.filter((_, index) => index % 2 === 1)
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      reviewAverage: reviewAverage(matchingReviews),
      reviewCount: `${matchingReviews.length}`,
      styleCount: '1'
    })
  })

  it('shows overall by style', async () => {
    const { reviews, data } = await insertMultipleReviews(9, ctx.db)

    const stats = await statsRepository.getOverall(ctx.db, {
      ...defaultFilter,
      style: data.otherStyle.id
    })
    const matchingReviews = reviews.filter((_, index) => index % 2 === 0)
    assertDeepEqual(stats, {
      beerCount: '1',
      breweryCount: '1',
      containerCount: '1',
      locationCount: '1',
      distinctBeerReviewCount: '1',
      reviewAverage: reviewAverage(matchingReviews),
      reviewCount: `${matchingReviews.length}`,
      styleCount: '1'
    })
  })
})
