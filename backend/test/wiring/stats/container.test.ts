import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { ContainerStats } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'

suite('container stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get container stats', async () => {
    const { containers, reviews } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{ container: ContainerStats }>(
      '/api/v1/stats/container',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const container = containers[0].data.container
    const containerRatings = reviews.map((r) => r.rating)
    assertDeepEqual(statsRes.data.container, [
      {
        reviewAverage: avgRatings(containerRatings),
        reviewCount: `${reviews.length}`,
        ...distributionStats(containerRatings),
        containerId: container.id,
        containerSize: container.size,
        containerType: container.type,
      },
    ])
  })

  test('get container stats by brewery', async () => {
    const {
      breweries,
      beers,
      containers,
      reviews: allReviews,
    } = await createStatsData(ctx.request, ctx.adminAuthHeaders())
    const breweryId = breweries[0].data.brewery.id

    const statsRes = await ctx.request.get<{ container: ContainerStats }>(
      `/api/v1/stats/container?brewery=${breweryId}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const container = containers[0].data.container
    const breweryBeers = beers
      .filter((b) => b.breweries.includes(breweryId))
      .map((b) => b.id)
    const reviews = allReviews.filter((r) => breweryBeers.includes(r.beer))
    const containerRatings = reviews.map((r) => r.rating)
    assertDeepEqual(statsRes.data.container, [
      {
        reviewAverage: avgRatings(containerRatings),
        reviewCount: `${reviews.length}`,
        ...distributionStats(containerRatings),
        containerId: container.id,
        containerSize: container.size,
        containerType: container.type,
      },
    ])
  })
})
