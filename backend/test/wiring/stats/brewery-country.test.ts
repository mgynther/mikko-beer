import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { BreweryCountryStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { oneReview } from './stats-helpers.js'

suite('brewery country stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // Average ascending is not the default order by country code.
  test('get brewery country stats filtered by location and ordered', async () => {
    const { oluthuone } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const query = `location=${oluthuone.id}&order=average&direction=asc`

    const res = await ctx.request.get<BreweryCountryStatsBody>(
      `/api/v1/stats/brewery_country?${query}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      breweryCountry: [
        {
          ...oneReview(6),
          reviewedBeerCount: '1',
          breweryCount: '1',
          countryCode: 'FI',
        },
        {
          ...oneReview(7),
          reviewedBeerCount: '1',
          breweryCount: '1',
          countryCode: 'BE',
        },
      ],
    })
  })
})
