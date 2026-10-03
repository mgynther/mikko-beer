import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { AnnualStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('annual stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get annual stats filtered by brewery', async () => {
    const { lindemans } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<AnnualStatsBody>(
      `/api/v1/stats/annual?brewery=${lindemans.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      annual: [
        { ...oneReview(7), year: '2024' },
        { ...oneReview(8), year: '2023' },
      ],
    })
  })
})
