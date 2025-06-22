import { expect } from 'earl'

import { TestContext } from '../test-context'
import * as statsRepository from '../../../src/data/stats/stats.repository'
import { insertMultipleReviews } from '../review-helpers'
import type { Review } from '../../../src/core/review/review'
import type { Pagination } from '../../../src/core/pagination'

const giantPage: Pagination = { size: 10000, skip: 0 }

function filterByContainer(reviews: Review[], containerId: string): Review[] {
  return reviews.filter(r => r.container === containerId)
}

describe('annual stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  function filterByYear(reviews: Review[], year: string): Review[] {
    return reviews.filter(r => `${new Date(r.time).getUTCFullYear()}` === year)
  }

  function avg(reviews: Review[], year: string) {
    if (reviews === null) throw new Error('must not be null')
    const filteredReviews = filterByYear(reviews, year)
    const sum = filteredReviews
      .map(r => r.rating)
      .reduce<number>((sum, rating) => sum + (rating ?? 0), 0)

    const numValue = sum / filteredReviews.length
    return numValue.toFixed(2)
  }

  it('no filters', async () => {
    const { reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(
      ctx.db,
      {
        brewery: undefined,
        location: undefined,
        style: undefined
      }
    )
    expect(stats).toEqual([
      {
        reviewAverage: avg(reviews, '2023'),
        reviewCount: `${filterByYear(reviews, '2023').length}`,
        year: '2023'
      },
      {
        reviewAverage: avg(reviews, '2024'),
        reviewCount: `${filterByYear(reviews, '2024').length}`,
        year: '2024'
      }
    ])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(
      ctx.db,
      {
        brewery: data.brewery.id,
        location: undefined,
        style: undefined
      }
    )
    expect(stats).toEqual([
      {
        reviewAverage: avg(reviews, '2024'),
        reviewCount: `${filterByYear(reviews, '2024').length}`,
        year: '2024'
      }
    ])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(
      ctx.db,
      {
        brewery: undefined,
        location: data.location.id,
        style: undefined
      }
    )
    expect(stats).toEqual([
      {
        reviewAverage: avg(reviews, '2024'),
        reviewCount: `${filterByYear(reviews, '2024').length}`,
        year: '2024'
      }
    ])
  })

  it('filter by style', async () => {
    const { data } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnual(
      ctx.db,
      {
        brewery: undefined,
        location: undefined,
        style: data.otherStyle.id
      }
    )
    expect(stats).toEqual([
      {
        reviewAverage: '6.60',
        reviewCount: '5',
        year: '2023'
      }
    ])
  })
})

describe('annual container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

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
    const stats = await statsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: undefined,
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
        reviewCount: `${filterByContainer(reviews, container.id).length}`,
        year: '2024'
      },
      {
        containerId: otherContainer.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: avg(reviews, otherContainer.id),
        reviewCount: `${filterByContainer(reviews, otherContainer.id).length}`,
        year: '2023'
      }
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
        reviewCount: `${filterByContainer(reviews, container.id).length}`,
        year: '2024'
      }
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
        style: undefined
      }
    )
    const { otherContainer } = data
    expect(stats).toEqual([
      {
        containerId: otherContainer.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: avg(reviews, otherContainer.id),
        reviewCount: `${filterByContainer(reviews, otherContainer.id).length}`,
        year: '2023'
      }
    ])
  })

  it('filter by brewery', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: data.brewery.id,
        location: undefined,
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
        reviewCount: `${filterByContainer(reviews, container.id).length}`,
        year: '2024'
      }
    ])
  })

  it('filter by location', async () => {
    const { data, reviews } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: data.location.id,
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
        reviewCount: `${filterByContainer(reviews, container.id).length}`,
        year: '2024'
      }
    ])
  })

  it('filter by style', async () => {
    const { data } = await insertMultipleReviews(9, ctx.db)
    const stats = await statsRepository.getAnnualContainer(
      ctx.db,
      giantPage,
      {
        brewery: undefined,
        location: undefined,
        style: data.otherStyle.id
      }
    )
    expect(stats).toEqual([
      {
        containerId: data.otherContainer.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: '6.60',
        reviewCount: '5',
        year: '2023'
      }
    ])
  })
})
