import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { AnnualContainerStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('annual container stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get a page of annual container stats filtered by brewery', async () => {
    const { lindemans, container } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<AnnualContainerStatsBody>(
      `/api/v1/stats/annual_container?brewery=${lindemans.id}&size=1&skip=0`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      annualContainer: [
        {
          ...oneReview(7),
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          year: '2024',
        },
      ],
    })
  })
})
