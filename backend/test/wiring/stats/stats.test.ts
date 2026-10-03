import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Client, RequestHeaders } from '../../client.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedContainer } from '../../../src/web/container/container.js'
import type { CreatedOrUpdatedLocation } from '../../../src/web/location/location.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'
import type {
  AnnualContainerStatsBody,
  AnnualStatsBody,
  BreweryCountryStatsBody,
  BreweryStatsBody,
  ContainerStatsBody,
  LocationStatsBody,
  OverallStatsBody,
  RatingStatsBody,
  StyleStatsBody,
} from '../../../src/web/stats/stats.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'

interface StatsData {
  lindemans: CreatedOrUpdatedBrewery
  nokian: CreatedOrUpdatedBrewery
  kriek: CreatedOrUpdatedStyle
  ipa: CreatedOrUpdatedStyle
  kuja: CreatedOrUpdatedLocation
  oluthuone: CreatedOrUpdatedLocation
  container: CreatedOrUpdatedContainer
}

// Lindemans, a Belgian brewery, brews a kriek, which is reviewed at Kuja in
// 2023 and rated 8, and at Oluthuone in 2024 and rated 7. Nokian Panimo, a
// Finnish one, brews an IPA, which is reviewed at Oluthuone in 2024 and
// rated 6. Each is drunk from the same bottle.
async function createStatsData(
  request: Client,
  headers: RequestHeaders,
): Promise<StatsData> {
  async function create<T>(path: string, body: object): Promise<T> {
    const res = await request.post<Record<string, T>>(
      `/api/v1/${path}`,
      body,
      headers,
    )
    assertEqual(res.status, 201)
    return res.data[path]
  }

  const [lindemans, nokian, kriek, ipa, kuja, oluthuone, container] =
    await Promise.all([
      create<CreatedOrUpdatedBrewery>('brewery', {
        name: 'Lindemans',
        country: 'BE',
      }),
      create<CreatedOrUpdatedBrewery>('brewery', {
        name: 'Nokian Panimo',
        country: 'FI',
      }),
      create<CreatedOrUpdatedStyle>('style', { name: 'Kriek', parents: [] }),
      create<CreatedOrUpdatedStyle>('style', { name: 'IPA', parents: [] }),
      create<CreatedOrUpdatedLocation>('location', { name: 'Kuja' }),
      create<CreatedOrUpdatedLocation>('location', { name: 'Oluthuone' }),
      create<CreatedOrUpdatedContainer>('container', {
        type: 'Bottle',
        size: '0.33',
      }),
    ])
  const [lindemansKriek, nokianIpa] = await Promise.all([
    create<CreatedOrUpdatedBeer>('beer', {
      name: 'Lindemans Kriek',
      breweries: [lindemans.id],
      styles: [kriek.id],
    }),
    create<CreatedOrUpdatedBeer>('beer', {
      name: 'Nokian IPA',
      breweries: [nokian.id],
      styles: [ipa.id],
    }),
  ])
  await Promise.all(
    [
      { beer: lindemansKriek, location: kuja, rating: 8, time: '2023-03-07' },
      {
        beer: lindemansKriek,
        location: oluthuone,
        rating: 7,
        time: '2024-05-01',
      },
      { beer: nokianIpa, location: oluthuone, rating: 6, time: '2024-06-01' },
    ].map(({ beer, location, rating, time }) =>
      create<CreatedOrUpdatedReview>('review', {
        additionalInfo: '',
        beer: beer.id,
        container: container.id,
        location: location.id,
        rating,
        smell: 'Fruity',
        taste: 'Fresh',
        time: `${time}T18:00:00.000Z`,
      }),
    ),
  )
  return { lindemans, nokian, kriek, ipa, kuja, oluthuone, container }
}

interface ReviewSummary {
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
}

// What a single review sums up to, as the stats answer it.
function oneReview(rating: number): ReviewSummary {
  return {
    reviewAverage: `${rating}.00`,
    reviewCount: '1',
    reviewStandardDeviation: '0.00',
    reviewMedian: `${rating}.00`,
    reviewMode: `${rating}`,
  }
}

suite('stats tests', () => {
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

  test('get a page of annual container stats filtered by brewery', async () => {
    const { lindemans, container } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<AnnualContainerStatsBody>(
      `/api/v1/stats/annual_container?brewery=${lindemans.id}&size=1&skip=0`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      annualContainer: [
        {
          ...oneReview(7),
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          year: '2024',
        },
      ],
    })
  })

  test('get container stats filtered by brewery', async () => {
    const { lindemans, container } = await createStatsData(
      ctx.request,
      ctx.adminAuthHeaders(),
    )

    const res = await ctx.request.get<ContainerStatsBody>(
      `/api/v1/stats/container?brewery=${lindemans.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    // The two reviews of the kriek, rated 8 and 7.
    assertDeepEqual(res.data, {
      container: [
        {
          reviewAverage: '7.50',
          reviewCount: '2',
          reviewStandardDeviation: '0.50',
          reviewMedian: '7.50',
          reviewMode: '7',
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
        },
      ],
    })
  })

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
