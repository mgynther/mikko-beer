import { expect } from 'earl'

import { TestContext } from '../test-context'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import { insertMultipleReviews } from '../review-helpers'
import type { Review } from '../../../src/core/review/review'

describe('container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function filterByContainer(reviews: Review[], containerId: string): Review[] {
    return reviews.filter(r => r.container === containerId)
  }

  function avg(reviews: Review[], containerId: string) {
    if (reviews === null) throw new Error('must not be null')
    const filteredReviews = filterByContainer(reviews, containerId)
    const sum = filteredReviews
      .map(r => r.rating)
      .reduce<number>((sum, rating) => sum + (rating ?? 0), 0)

    const numValue = sum / filteredReviews.length
    return numValue.toFixed(2)
  }

  it('no filters', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(
      ctx.db,
      {
        brewery: undefined,
        style: undefined
      }
    )
    const { container, otherContainer } = data
    expect(stats).toEqual([
      {
        containerId: container.id,
        containerSize: '0.50',
        containerType: 'bottle',
        reviewAverage: avg(reviews, container.id),
        reviewCount: `${filterByContainer(reviews, container.id).length}`
      },
      {
        containerId: otherContainer.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: avg(reviews, otherContainer.id),
        reviewCount: `${filterByContainer(reviews, otherContainer.id).length}`
      }
    ])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(
      ctx.db,
      {
        brewery: data.brewery.id,
        style: undefined
      }
    )
    const { container } = data
    expect(stats).toEqual([
      {
        containerId: container.id,
        containerSize: '0.50',
        containerType: 'bottle',
        reviewAverage: avg(reviews, container.id),
        reviewCount: `${filterByContainer(reviews, container.id).length}`
      }
    ])
  })

  it('filter by style', async () => {
    const { data } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getContainer(
      ctx.db,
      {
        brewery: undefined,
        style: data.otherStyle.id
      }
    )
    expect(stats).toEqual([
      {
        containerId: data.otherContainer.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: '6.60',
        reviewCount: '5'
      }
    ])
  })
})
