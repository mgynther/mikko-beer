import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'
import type { MockFunction } from '../mock.js'

import type {
  AnnualContainerStatsBody,
  AnnualStatsBody,
  BreweryCountryStatsBody,
  BreweryStatsBody,
  ContainerStatsBody,
  IdFilteredStatsRequest,
  LocationStatsBody,
  OverallStatsBody,
  RatingStatsBody,
  OrderedStatsRequest,
  PaginatedIdFilteredStatsRequest,
  PaginatedOrderedStatsRequest,
  StatsFilterQuery,
  StatsHandlers,
  StatsIdFilterQuery,
  StatsOrderQuery,
  StyleStatsBody,
} from '../../src/web/stats/stats.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const breweryId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'

const idFilterQueryString = `brewery=${breweryId}`

const idFilter: StatsIdFilterQuery = {
  brewery: breweryId,
  location: undefined,
  style: undefined,
}

const filterQueryString =
  `${idFilterQueryString}&min_review_count=2&max_review_count=50` +
  '&min_review_average=6&max_review_average=9.5' +
  '&time_start=1767225600000&time_end=1798761600000'

const filter: StatsFilterQuery = {
  ...idFilter,
  minReviewCount: '2',
  maxReviewCount: '50',
  minReviewAverage: '6',
  maxReviewAverage: '9.5',
  timeStart: '1767225600000',
  timeEnd: '1798761600000',
}

const orderQueryString = 'order=average&direction=desc'

const order: StatsOrderQuery = { order: 'average', direction: 'desc' }

suite('stats routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  async function expectIdFiltered(
    path: string,
    stats: Partial<StatsHandlers>,
    get: MockFunction<[request: IdFilteredStatsRequest], Promise<object>>,
    body: object,
  ) {
    await server.start({ stats })

    const res = await server.request.get(
      `/api/v1/stats/${path}?${idFilterQueryString}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      get.mock.calls.map((call) => call.arguments),
      [[{ authorization, filter: idFilter }]],
    )
  }

  test('get overall stats', async () => {
    const body: OverallStatsBody = {
      overall: {
        beerCount: '482',
        breweryCount: '91',
        breweryCountryCount: '12',
        containerCount: '7',
        locationCount: '15',
        distinctBeerReviewCount: '455',
        reviewAverage: '7.52',
        reviewCount: '613',
        reviewStandardDeviation: '1.08',
        reviewMedian: '8',
        reviewMode: '8',
        reviewWithLocationCount: '410',
        reviewWithoutLocationCount: '203',
        styleCount: '64',
      },
    }
    const getOverall = mockFunction<
      [request: IdFilteredStatsRequest],
      Promise<OverallStatsBody>
    >(async () => body)
    await expectIdFiltered('overall', { getOverall }, getOverall, body)
  })

  test('get annual stats', async () => {
    const body: AnnualStatsBody = { annual: [] }
    const getAnnual = mockFunction<
      [request: IdFilteredStatsRequest],
      Promise<AnnualStatsBody>
    >(async () => body)
    await expectIdFiltered('annual', { getAnnual }, getAnnual, body)
  })

  test('get container stats', async () => {
    const body: ContainerStatsBody = { container: [] }
    const getContainer = mockFunction<
      [request: IdFilteredStatsRequest],
      Promise<ContainerStatsBody>
    >(async () => body)
    await expectIdFiltered('container', { getContainer }, getContainer, body)
  })

  test('get rating stats', async () => {
    const body: RatingStatsBody = { rating: [] }
    const getRating = mockFunction<
      [request: IdFilteredStatsRequest],
      Promise<RatingStatsBody>
    >(async () => body)
    await expectIdFiltered('rating', { getRating }, getRating, body)
  })

  test('get annual container stats', async () => {
    const body: AnnualContainerStatsBody = { annualContainer: [] }
    const getAnnualContainer = mockFunction<
      [request: PaginatedIdFilteredStatsRequest],
      Promise<AnnualContainerStatsBody>
    >(async () => body)
    await server.start({ stats: { getAnnualContainer } })

    const res = await server.request.get(
      `/api/v1/stats/annual_container?size=20&skip=40&${idFilterQueryString}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      getAnnualContainer.mock.calls.map((call) => call.arguments),
      [
        [
          {
            authorization,
            pagination: { size: '20', skip: '40' },
            filter: idFilter,
          },
        ],
      ],
    )
  })

  async function expectPaginatedOrdered(
    path: string,
    stats: Partial<StatsHandlers>,
    get: MockFunction<[request: PaginatedOrderedStatsRequest], Promise<object>>,
    body: object,
  ) {
    await server.start({ stats })

    const res = await server.request.get(
      `/api/v1/stats/${path}?size=20&skip=40&${filterQueryString}&${
        orderQueryString
      }`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      get.mock.calls.map((call) => call.arguments),
      [
        [
          {
            authorization,
            pagination: { size: '20', skip: '40' },
            filter,
            order,
          },
        ],
      ],
    )
  }

  test('get brewery stats', async () => {
    const body: BreweryStatsBody = { brewery: [] }
    const getBrewery = mockFunction<
      [request: PaginatedOrderedStatsRequest],
      Promise<BreweryStatsBody>
    >(async () => body)
    await expectPaginatedOrdered('brewery', { getBrewery }, getBrewery, body)
  })

  test('get brewery country stats', async () => {
    const body: BreweryCountryStatsBody = { breweryCountry: [] }
    const getBreweryCountry = mockFunction<
      [request: PaginatedOrderedStatsRequest],
      Promise<BreweryCountryStatsBody>
    >(async () => body)
    await expectPaginatedOrdered(
      'brewery_country',
      { getBreweryCountry },
      getBreweryCountry,
      body,
    )
  })

  test('get location stats', async () => {
    const body: LocationStatsBody = { location: [] }
    const getLocation = mockFunction<
      [request: PaginatedOrderedStatsRequest],
      Promise<LocationStatsBody>
    >(async () => body)
    await expectPaginatedOrdered('location', { getLocation }, getLocation, body)
  })

  test('get style stats', async () => {
    const body: StyleStatsBody = { style: [] }
    const getStyle = mockFunction<
      [request: OrderedStatsRequest],
      Promise<StyleStatsBody>
    >(async () => body)
    await server.start({ stats: { getStyle } })

    const res = await server.request.get(
      `/api/v1/stats/style?${filterQueryString}&${orderQueryString}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      getStyle.mock.calls.map((call) => call.arguments),
      [[{ authorization, filter, order }]],
    )
  })
})
