import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { ContainerStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'

suite('container stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get container stats filtered by brewery', async () => {
    const { lindemans, container } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<ContainerStatsBody>(
      `/api/v1/stats/container?brewery=${lindemans.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    // The two reviews of the kriek, rated 8 and 7.
    assertDeepEqual(res.data, {
      container: [
        {
          reviewAverage: '7.50',
          reviewCount: '2',
          reviewStandardDeviation: '0.50',
          reviewMedian: '7.50',
          reviewMode: '7',
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
        },
      ],
    })
  })
})
