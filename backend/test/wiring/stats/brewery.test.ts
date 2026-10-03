import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { BreweryStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('brewery stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // Average ascending is not the default order by name.
  test('get brewery stats filtered by location and ordered', async () => {
    const { lindemans, nokian, oluthuone } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const query = `location=${oluthuone.id}&order=average&direction=asc`

    const res = await ctx.request.get<BreweryStatsBody>(
      `/api/v1/stats/brewery?${query}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      brewery: [nokian, lindemans].map((brewery, index) => ({
        ...oneReview(6 + index),
        reviewedBeerCount: '1',
        breweryId: brewery.id,
        breweryName: brewery.name,
        breweryCountry: brewery.country,
      })),
    })
  })
})
