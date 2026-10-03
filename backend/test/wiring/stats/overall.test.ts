import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { OverallStatsBody } from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'

suite('overall stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('get overall stats filtered by brewery', async () => {
    const { lindemans } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<OverallStatsBody>(
      `/api/v1/stats/overall?brewery=${lindemans.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    // The two reviews of the kriek, rated 8 and 7.
    assertDeepEqual(res.data, {
      overall: {
        beerCount: '1',
        breweryCount: '1',
        breweryCountryCount: '1',
        containerCount: '1',
        locationCount: '2',
        distinctBeerReviewCount: '1',
        reviewAverage: '7.50',
        reviewCount: '2',
        reviewStandardDeviation: '0.50',
        reviewMedian: '7.50',
        reviewMode: '7',
        reviewWithLocationCount: '2',
        reviewWithoutLocationCount: '0',
        styleCount: '1',
      },
    })
  })
})
