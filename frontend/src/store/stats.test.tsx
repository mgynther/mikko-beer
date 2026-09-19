import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import type {
  AnnualContainerStatsQueryParams,
  BreweryCountryStatsQueryParams,
  BreweryStatsQueryParams,
  IdParams,
  LocationStatsQueryParams,
  StyleStatsQueryParams,
} from './internal/stats/requests'
import {
  useGetAnnualContainerStats,
  useGetAnnualStats,
  useGetBreweryCountryStats,
  useGetBreweryStats,
  useGetContainerStats,
  useGetLocationStats,
  useGetOverallStats,
  useGetRatingStats,
  useGetStyleStats,
} from './stats'

// See store/beer.test.tsx for what the store layer's tests are for and why
// the helpers render the data as text.
let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

const noIds: IdParams = {
  breweryId: undefined,
  locationId: undefined,
  styleId: undefined,
}

const filters = {
  minReviewCount: 40,
  maxReviewCount: 80,
  minReviewAverage: 9.0,
  maxReviewAverage: 9.3,
  timeStart: 1,
  timeEnd: 2,
}

const filterSearch =
  `min_review_count=${filters.minReviewCount}` +
  `&max_review_count=${filters.maxReviewCount}` +
  `&min_review_average=${filters.minReviewAverage}` +
  `&max_review_average=${filters.maxReviewAverage}` +
  `&time_start=${filters.timeStart}&time_end=${filters.timeEnd}`

const breweryParams: BreweryStatsQueryParams = {
  ...noIds,
  pagination: { size: 10, skip: 0 },
  sorting: { order: 'average', direction: 'asc' },
  ...filters,
}

function pagedPath(endpoint: string, order: string): string {
  return (
    `/api/v1/stats/${endpoint}?size=10&skip=0` +
    `&order=${order}&direction=asc&${filterSearch}`
  )
}

function AnnualStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const { data, isLoading } = useGetAnnualStats(props.params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

const breweryId = 'f0a1b2c3-d4e5-4607-8819-2a3b4c5d6e7f'

test('get annual stats', async () => {
  const expectedResponse = { annual: [{ year: '2023', reviewCount: '12' }] }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/stats/annual?brewery=${breweryId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <AnnualStatsHelper params={{ ...noIds, breweryId }} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ContainerStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const { data, isLoading } = useGetContainerStats(props.params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

const locationId = 'a1b2c3d4-e5f6-4718-9920-3b4c5d6e7f80'

test('get container stats', async () => {
  const expectedResponse = { container: [{ containerId: 'c', count: '2' }] }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/stats/container?location=${locationId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ContainerStatsHelper params={{ ...noIds, locationId }} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function OverallStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const { data, isLoading } = useGetOverallStats(props.params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

const styleId = 'b2c3d4e5-f607-4829-8a31-4c5d6e7f8091'

test('get overall stats', async () => {
  const expectedResponse = { overall: { beerCount: '482' } }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/stats/overall?style=${styleId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <OverallStatsHelper params={{ ...noIds, styleId }} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function RatingStatsHelper(props: { params: IdParams }): React.JSX.Element {
  const { data, isLoading } = useGetRatingStats(props.params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get rating stats', async () => {
  const expectedResponse = { rating: [{ rating: '8', count: '25' }] }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/stats/rating',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <RatingStatsHelper params={noIds} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function StyleStatsHelper(props: {
  params: StyleStatsQueryParams
}): React.JSX.Element {
  const { data, isLoading } = useGetStyleStats(props.params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get style stats', async () => {
  const params: StyleStatsQueryParams = {
    ...noIds,
    sorting: { order: 'average', direction: 'asc' },
    ...filters,
  }
  const expectedResponse = { style: [{ styleId: 's', reviewCount: '3' }] }
  server?.addResponse({
    method: 'GET',
    pathname:
      `/api/v1/stats/style?order=${params.sorting.order}` +
      `&direction=${params.sorting.direction}&${filterSearch}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <StyleStatsHelper params={params} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

interface AnnualContainerStatsProps {
  onResult: (result: unknown) => void
  params: AnnualContainerStatsQueryParams
}

function AnnualContainerStatsHelper(
  props: AnnualContainerStatsProps,
): React.JSX.Element {
  const { query, data, isFetching } = useGetAnnualContainerStats()
  return (
    <div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onResult(await query(props.params))
          })()
        }}
      >
        Query
      </button>
    </div>
  )
}

test('query annual container stats', async () => {
  const user = setupUser()
  const styleId = 'c3d4e5f6-0718-492a-8b42-5d6e7f809123'
  const expectedResponse = {
    annualContainer: [{ containerId: 'c', year: '2023' }],
  }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/stats/annual_container?size=10&skip=0&style=${styleId}`,
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <AnnualContainerStatsHelper
        onResult={onResult}
        params={{
          ...noIds,
          styleId,
          pagination: { size: 10, skip: 0 },
        }}
      />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not fetching')).toBeDefined()
})

interface BreweryStatsProps {
  onResult: (result: unknown) => void
  params: BreweryStatsQueryParams
}

function BreweryStatsHelper(props: BreweryStatsProps): React.JSX.Element {
  const { query, data, isFetching } = useGetBreweryStats()
  return (
    <div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onResult(await query(props.params))
          })()
        }}
      >
        Query
      </button>
    </div>
  )
}

test('query brewery stats', async () => {
  const user = setupUser()
  const expectedResponse = { brewery: [{ breweryId: 'b', reviewCount: '9' }] }
  server?.addResponse({
    method: 'GET',
    pathname: pagedPath('brewery', 'average'),
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <BreweryStatsHelper onResult={onResult} params={breweryParams} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
})

interface BreweryCountryStatsProps {
  onResult: (result: unknown) => void
  params: BreweryCountryStatsQueryParams
}

function BreweryCountryStatsHelper(
  props: BreweryCountryStatsProps,
): React.JSX.Element {
  const { query, data, isFetching } = useGetBreweryCountryStats()
  return (
    <div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onResult(await query(props.params))
          })()
        }}
      >
        Query
      </button>
    </div>
  )
}

test('query brewery country stats', async () => {
  const user = setupUser()
  const expectedResponse = {
    breweryCountry: [{ countryCode: 'FI', reviewCount: '9' }],
  }
  server?.addResponse({
    method: 'GET',
    pathname: pagedPath('brewery_country', 'average'),
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <BreweryCountryStatsHelper
        onResult={onResult}
        params={{
          ...breweryParams,
          sorting: { order: 'average', direction: 'asc' },
        }}
      />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
})

interface LocationStatsProps {
  onResult: (result: unknown) => void
  params: LocationStatsQueryParams
}

function LocationStatsHelper(props: LocationStatsProps): React.JSX.Element {
  const { query, data, isFetching } = useGetLocationStats()
  return (
    <div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onResult(await query(props.params))
          })()
        }}
      >
        Query
      </button>
    </div>
  )
}

test('query location stats', async () => {
  const user = setupUser()
  const expectedResponse = { location: [{ locationId: 'l', reviewCount: '9' }] }
  server?.addResponse({
    method: 'GET',
    pathname: pagedPath('location', 'average'),
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <LocationStatsHelper
        onResult={onResult}
        params={{
          ...breweryParams,
          sorting: { order: 'average', direction: 'asc' },
        }}
      />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
})

test('an infinite maximum review count is left out of the query', async () => {
  const user = setupUser()
  const expectedResponse = { brewery: [{ breweryId: 'b' }] }
  server?.addResponse({
    method: 'GET',
    pathname:
      '/api/v1/stats/brewery?size=10&skip=0&order=brewery_name&direction=asc' +
      `&min_review_count=${filters.minReviewCount}` +
      `&min_review_average=${filters.minReviewAverage}` +
      `&max_review_average=${filters.maxReviewAverage}` +
      `&time_start=${filters.timeStart}&time_end=${filters.timeEnd}`,
    response: expectedResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <BreweryStatsHelper
        onResult={onResult}
        params={{
          ...breweryParams,
          sorting: { order: 'brewery_name', direction: 'asc' },
          maxReviewCount: Infinity,
        }}
      />
    </StoreProvider>,
  )

  // No maximum is Infinity, and a filter that lets everything through is not
  // sent at all.
  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
})

test('a failed query gives undefined data rather than rejecting', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: pagedPath('brewery', 'count'),
    response: { error: 'Nope' },
    status: 500,
  })

  const onResult = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <BreweryStatsHelper
        onResult={onResult}
        params={{
          ...breweryParams,
          sorting: { order: 'count', direction: 'asc' },
        }}
      />
    </StoreProvider>,
  )

  // The filtered views query while the user moves the filters around, so a
  // failure is data that did not arrive rather than an error to throw.
  await user.click(getByRole('button', { name: 'Query' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(undefined)
  })
})
