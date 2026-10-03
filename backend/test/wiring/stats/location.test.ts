import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { LocationStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('location stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // Average ascending is not the default order by name.
  test('get location stats filtered by brewery and ordered', async () => {
    const { lindemans, kuja, oluthuone } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const query = `brewery=${lindemans.id}&order=average&direction=asc`

    const res = await ctx.request.get<LocationStatsBody>(
      `/api/v1/stats/location?${query}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      location: [
        {
          ...oneReview(7),
          locationId: oluthuone.id,
          locationName: 'Oluthuone',
        },
        { ...oneReview(8), locationId: kuja.id, locationName: 'Kuja' },
      ],
    })
  })
})
