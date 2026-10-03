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
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { BreweryCountryStats } from '../../../src/web/stats/stats.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { createStatsData } from './stats-data.js'
import { avgRatings, distributionStats } from './stats-helpers.js'

suite('brewery country stats', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // createStatsData gives each country one brewery, so its collaboration beer
  // cannot show the difference between counting a review once per country
  // and once per brewery of a country. A second Finnish brewery and a beer
  // of both Finnish ones can.
  async function createSecondFinnishBrewery(
    styles: Array<{ data: { style: CreatedOrUpdatedStyle } }>,
    breweries: Array<{ data: { brewery: CreatedOrUpdatedBrewery } }>,
    containerId: string,
  ) {
    const breweryRes = await ctx.request.post<{
      brewery: CreatedOrUpdatedBrewery
    }>(
      `/api/v1/brewery`,
      { name: 'Sonnisaari', country: 'FI' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(breweryRes.status, 201)

    const beerRes = await ctx.request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: 'Double Finn',
        breweries: [breweries[1].data.brewery.id, breweryRes.data.brewery.id],
        styles: [styles[1].data.style.id],
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(beerRes.status, 201)

    const reviewRes = await ctx.request.post<{
      review: CreatedOrUpdatedReview
    }>(
      `/api/v1/review`,
      {
        additionalInfo: '',
        beer: beerRes.data.beer.id,
        container: containerId,
        location: '',
        rating: 9,
        smell: 'Pine',
        taste: 'Resinous',
        time: '2023-06-01T18:31:33.123Z',
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(reviewRes.status, 201)

    return { brewery: breweryRes.data.brewery, beer: beerRes.data.beer }
  }

  test('get brewery country stats', async () => {
    const { breweries, containers, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )
    await createSecondFinnishBrewery(
      styles,
      breweries,
      containers[0].data.container.id,
    )

    const statsRes = await ctx.request.get<{
      breweryCountry: BreweryCountryStats
    }>('/api/v1/stats/brewery_country', ctx.adminAuthHeaders())
    assertEqual(statsRes.status, 200)

    // BE: Lindemans Kriek 5, and the two reviews of the Belgian-Finnish
    // collaboration, 8 and 7.
    const beRatings = [5, 8, 7]
    // FI: the Nokian IPA 7, the same two collaboration reviews, and Double
    // Finn 9 - once, although both of its breweries are Finnish.
    const fiRatings = [7, 8, 7, 9]
    assertDeepEqual(statsRes.data.breweryCountry, [
      {
        reviewAverage: avgRatings(beRatings),
        reviewCount: '3',
        ...distributionStats(beRatings),
        reviewedBeerCount: '2',
        breweryCount: '1',
        countryCode: 'BE',
      },
      {
        reviewAverage: avgRatings(fiRatings),
        reviewCount: '4',
        ...distributionStats(fiRatings),
        reviewedBeerCount: '3',
        breweryCount: '2',
        countryCode: 'FI',
      },
    ])
  })

  test('get brewery country stats ordered by brewery count', async () => {
    const { breweries, containers, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )
    await createSecondFinnishBrewery(
      styles,
      breweries,
      containers[0].data.container.id,
    )

    const statsRes = await ctx.request.get<{
      breweryCountry: BreweryCountryStats
    }>(
      '/api/v1/stats/brewery_country?order=brewery_count&direction=desc',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    assertDeepEqual(
      statsRes.data.breweryCountry.map((row) => [
        row.countryCode,
        row.breweryCount,
      ]),
      [
        ['FI', '2'],
        ['BE', '1'],
      ],
    )
  })

  test('get brewery country stats by brewery', async () => {
    const { breweries, containers, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )
    const { brewery: sonnisaari } = await createSecondFinnishBrewery(
      styles,
      breweries,
      containers[0].data.container.id,
    )

    const statsRes = await ctx.request.get<{
      breweryCountry: BreweryCountryStats
    }>(
      `/api/v1/stats/brewery_country?brewery=${sonnisaari.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 200)
    // Sonnisaari brews Double Finn only, whose breweries are both Finnish,
    // so only FI is left and its one review counts once.
    assertDeepEqual(statsRes.data.breweryCountry, [
      {
        reviewAverage: avgRatings([9]),
        reviewCount: '1',
        ...distributionStats([9]),
        reviewedBeerCount: '1',
        breweryCount: '2',
        countryCode: 'FI',
      },
    ])
  })

  test('get brewery country stats paginated', async () => {
    const { breweries, containers, styles } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )
    await createSecondFinnishBrewery(
      styles,
      breweries,
      containers[0].data.container.id,
    )

    const statsRes = await ctx.request.get<{
      breweryCountry: BreweryCountryStats
    }>('/api/v1/stats/brewery_country?size=1&skip=1', ctx.adminAuthHeaders())
    assertEqual(statsRes.status, 200)
    assertEqual(statsRes.data.breweryCountry.length, 1)
    assertEqual(statsRes.data.breweryCountry[0].countryCode, 'FI')
  })

  test('fail to get brewery country stats with an invalid order', async () => {
    const statsRes = await ctx.request.get(
      '/api/v1/stats/brewery_country?order=brewery_name',
      ctx.adminAuthHeaders(),
    )
    assertEqual(statsRes.status, 400)
    assertEqual(statsRes.data.error.code, 'InvalidBreweryCountryStatsQuery')
  })
})
