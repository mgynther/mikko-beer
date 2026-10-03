import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { StyleStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('style stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // Average descending is not the default order by name.
  test('get style stats filtered by location and ordered', async () => {
    const { kriek, ipa, oluthuone } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const query = `location=${oluthuone.id}&order=average&direction=desc`

    const res = await ctx.request.get<StyleStatsBody>(
      `/api/v1/stats/style?${query}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      style: [
        { ...oneReview(7), styleId: kriek.id, styleName: 'Kriek' },
        { ...oneReview(6), styleId: ipa.id, styleName: 'IPA' },
      ],
    })
  })
})
