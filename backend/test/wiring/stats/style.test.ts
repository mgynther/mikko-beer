import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { StyleStats } from '../../../src/web/stats/stats.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'

suite('style stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface StyleStatData {
    ratings: number[]
    style: CreatedOrUpdatedStyle
    average: string
    count: number
  }

  function checkStyleStats(
    ipa: StyleStatData,
    kriek: StyleStatData,
    styleStats: StyleStats,
  ) {
    const ipaAverage = avgRatings(ipa.ratings)
    const kriekAverage = avgRatings(kriek.ratings)
    assertDeepEqual(styleStats, [
      {
        reviewCount: `${ipa.ratings.length}`,
        reviewAverage: ipa.average,
        ...distributionStats(ipa.ratings),
        styleId: ipa.style.id,
        styleName: ipa.style.name,
      },
      {
        reviewCount: `${kriek.ratings.length}`,
        reviewAverage: kriek.average,
        ...distributionStats(kriek.ratings),
        styleId: kriek.style.id,
        styleName: kriek.style.name,
      },
    ])
    assertEqual(ipa.ratings.length, ipa.count)
    assertEqual(ipaAverage, ipa.average)
    assertEqual(kriek.ratings.length, kriek.count)
    assertEqual(kriekAverage, kriek.average)
  }

  function reviewRatingsByStyle(
    styleId: string,
    beers: CreatedOrUpdatedBeer[],
    reviews: CreatedOrUpdatedReview[],
    filterBreweryId: string | undefined,
  ): number[] {
    return reviews
      .filter((review) => {
        const beer = beers.find((beer) => beer.id === review.beer)
        if (beer === undefined) throw new Error('must not happen')
        return (
          beer.styles.some((style) => style === styleId) &&
          beer.breweries.some(
            (brewery) =>
              filterBreweryId === undefined || brewery === filterBreweryId,
          )
        )
      })
      .map((review) => review.rating)
  }

  test('get style stats', async () => {
    const { beers, reviews, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      '/api/v1/stats/style?order=average&direction=desc',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')
    const ipaRatings = reviewRatingsByStyle(
      ipaStyle.id,
      beers,
      reviews,
      undefined,
    )
    const kriekRatings = reviewRatingsByStyle(
      kriekStyle.id,
      beers,
      reviews,
      undefined,
    )
    checkStyleStats(
      {
        ratings: ipaRatings,
        style: ipaStyle,
        average: '7.33',
        count: 3,
      },
      {
        ratings: kriekRatings,
        style: kriekStyle,
        average: '6.67',
        count: 3,
      },
      statsRes.data.style,
    )
  })

  test('get style stats by brewery', async () => {
    const { beers, breweries, reviews, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const breweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?brewery=${breweryId}${order}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')
    const ipaRatings = reviewRatingsByStyle(
      ipaStyle.id,
      beers,
      reviews,
      breweryId,
    )
    const kriekRatings = reviewRatingsByStyle(
      kriekStyle.id,
      beers,
      reviews,
      breweryId,
    )
    checkStyleStats(
      {
        ratings: ipaRatings,
        style: ipaStyle,
        average: '7.50',
        count: 2,
      },
      {
        ratings: kriekRatings,
        style: kriekStyle,
        average: '6.67',
        count: 3,
      },
      statsRes.data.style,
    )
  })

  test('get style stats by brewery and min review count', async () => {
    const { beers, breweries, reviews, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const breweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?brewery=${breweryId}${order}&min_review_count=3`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')

    const kriekRatings = reviewRatingsByStyle(
      kriekStyle.id,
      beers,
      reviews,
      breweryId,
    )
    const kriekAverage = avgRatings(kriekRatings)
    assertDeepEqual(statsRes.data.style, [
      {
        reviewCount: '3',
        reviewAverage: kriekAverage,
        ...distributionStats(kriekRatings),
        styleId: kriekStyle.id,
        styleName: kriekStyle.name,
      },
    ])
    assertEqual(kriekRatings.length, 3)
    assertEqual(kriekAverage, '6.67')
  })

  test('get style stats by style', async () => {
    const { styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const styleId = styles[0].data.style.id
    const order = '&order=average&direction=desc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?style=${styleId}${order}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')

    assertDeepEqual(statsRes.data.style, [
      {
        // Collab reviews only.
        reviewCount: '2',
        reviewAverage: '7.50',
        ...distributionStats([8, 7]),
        styleId: ipaStyle.id,
        styleName: ipaStyle.name,
      },
      {
        reviewCount: '3',
        reviewAverage: '6.67',
        ...distributionStats([5, 8, 7]),
        styleId: kriekStyle.id,
        styleName: kriekStyle.name,
      },
    ])
  })

  test('get style stats by time', async () => {
    const { styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const order = '&order=average&direction=desc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?time_start=1646092800000&time_end=1648771200000${
        order
      }`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')

    assertDeepEqual(statsRes.data.style, [
      {
        reviewCount: '1',
        reviewAverage: '7.00',
        ...distributionStats([7]),
        styleId: ipaStyle.id,
        styleName: ipaStyle.name,
      },
    ])
  })
})
