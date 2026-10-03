import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { RatingStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'

suite('rating stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get rating stats filtered by brewery', async () => {
    const { lindemans } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<RatingStatsBody>(
      `/api/v1/stats/rating?brewery=${lindemans.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      rating: [
        { rating: '7', count: '1' },
        { rating: '8', count: '1' },
      ],
    })
  })
})
