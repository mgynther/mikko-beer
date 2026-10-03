import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { OverallStats } from '../../../src/web/stats/stats.js'
import { assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'

suite('overall stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function addNoLocationReview(
    beerId: string,
    containerId: string,
    rating: number,
    time: string,
  ): Promise<CreatedOrUpdatedReview> {
    const res = await ctx.request.post<{ review: CreatedOrUpdatedReview }>(
      `/api/v1/review`,
      {
        additionalInfo: '',
        beer: beerId,
        container: containerId,
        location: '',
        rating,
        smell: 'Plain',
        taste: 'Plain',
        time,
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.review
  }

  test('get overall stats', async () => {
    const { beers, breweries, reviews, containers, styles } =
      await createStatsData(ctx.request, ctx.adminAuthHeaders())
    const noLocationReview = await addNoLocationReview(
      beers[0].id,
      containers[0].data.container.id,
      6,
      '2023-04-01T18:31:33.123Z',
    )
    const allReviews = [...reviews, noLocationReview]

    const statsRes = await ctx.request.get<{ overall: OverallStats }>(
      '/api/v1/stats/overall',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    assertEqual(statsRes.data.overall.beerCount, `${beers.length}`)
    assertEqual(beers.length, 3)
    assertEqual(statsRes.data.overall.breweryCount, `${breweries.length}`)
    assertEqual(breweries.length, 2)
    // Lindemans is BE, Nokian Panimo is FI.
    assertEqual(statsRes.data.overall.breweryCountryCount, '2')
    assertEqual(statsRes.data.overall.containerCount, `${containers.length}`)
    assertEqual(containers.length, 1)
    assertEqual(statsRes.data.overall.reviewCount, `${allReviews.length}`)
    assertEqual(allReviews.length, 5)
    assertEqual(
      statsRes.data.overall.distinctBeerReviewCount,
      `${beers.length}`,
    )
    const ratings = allReviews.filter((r) => r).map((r) => r.rating)
    const ratingSum = ratings.reduce(
      (sum: number, rating: number) => sum + rating,
      0,
    )
    const countedAverage = ratingSum / allReviews.length
    assertEqual(statsRes.data.overall.reviewAverage, countedAverage.toFixed(2))
    assertEqual(countedAverage, 6.6)
    assertEqual(statsRes.data.overall.reviewWithLocationCount, '4')
    assertEqual(statsRes.data.overall.reviewWithoutLocationCount, '1')
    assertEqual(statsRes.data.overall.styleCount, `${styles.length}`)
    assertEqual(styles.length, 2)
  })

  test('get overall stats by brewery', async () => {
    const { beers, breweries, reviews, containers, styles } =
      await createStatsData(ctx.request, ctx.adminAuthHeaders())
    const noLocationReview = await addNoLocationReview(
      beers[0].id,
      containers[0].data.container.id,
      6,
      '2023-04-02T18:31:33.123Z',
    )
    const allReviews = [...reviews, noLocationReview]

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ overall: OverallStats }>(
      `/api/v1/stats/overall?brewery=${breweryId}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    assertEqual(statsRes.data.overall.beerCount, '2')
    assertEqual(statsRes.data.overall.breweryCount, '2')
    // The collaboration beer brings Nokian Panimo along with its country.
    assertEqual(statsRes.data.overall.breweryCountryCount, '2')
    assertEqual(statsRes.data.overall.containerCount, '1')
    assertEqual(statsRes.data.overall.reviewCount, '4')
    const ratings = allReviews
      .filter((review: CreatedOrUpdatedReview) => {
        const beerId = review.beer
        const beer = beers.find((beer) => beer.id === beerId)
        if (beer === undefined) {
          return false
        }
        return beer.breweries.includes(breweryId)
      })
      .map((r) => r.rating)
    const ratingSum = ratings.reduce(
      (sum: number, rating: number) => sum + rating,
      0,
    )
    const countedAverage = ratingSum / ratings.length
    assertEqual(statsRes.data.overall.reviewAverage, countedAverage.toFixed(2))
    assertEqual(countedAverage, 6.5)
    assertEqual(statsRes.data.overall.reviewWithLocationCount, '3')
    assertEqual(statsRes.data.overall.reviewWithoutLocationCount, '1')
    assertEqual(statsRes.data.overall.styleCount, '2')
    assertEqual(styles.length, 2)
  })
})
