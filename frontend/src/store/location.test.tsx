import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import {
  useCreateLocation,
  useGetLocation,
  useListLocations,
  useSearchLocations,
  useUpdateLocation,
} from './location'
import { createErrorLogger } from '../../test-util/error-logger'

// The store layer is where the requests are real: these tests drive the test
// server and prove that a public function asks for the right url with the
// right method and gives the response back untouched. What the response means
// is the validation layer's business and what is done with it is the
// storehooks'.
//
// The data is unknown here, so the helpers render it as text rather than
// reaching into it. That is the whole point of the type.
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

const locationId = 'f8d8e7b6-5a4c-4d9e-b1f2-3a4b5c6d7e8f'
const location = {
  id: locationId,
  name: 'Test location',
}
const locationResponse = { location }
const locationListResponse = { locations: [location] }

function GetLocationHelper(props: { locationId: string }): React.JSX.Element {
  const { data, isLoading } = useGetLocation(props.locationId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get location', async () => {
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${locationId}`,
    response: locationResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetLocationHelper locationId={locationId} />
    </StoreProvider>,
  )
  expect(getByText('Loading')).toBeDefined()

  await waitFor(() => {
    expect(getByText(JSON.stringify(locationResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

test('get location that does not exist', async () => {
  // A different id than the test above: a response the store has cached is
  // served from the cache, not from the server.
  const missingId = 'd6b6c5f4-3e2a-4b7c-9d0e-1f2a3b4c5d6e'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${missingId}`,
    response: { error: { code: 'LocationNotFound', message: 'not found' } },
    status: 404,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetLocationHelper locationId={missingId} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
  // A failed request has no data to give.
  expect(getByText('No data')).toBeDefined()
})

interface TriggerProps {
  onResult: (result: unknown) => void
  onError: () => void
}

interface ListProps extends TriggerProps {
  size: number
}

function ListLocationsHelper(props: ListProps): React.JSX.Element {
  const { list, data, isFetching, isUninitialized } = useListLocations()
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            try {
              props.onResult(await list({ size: props.size, skip: 0 }))
            } catch {
              props.onError()
            }
          })().catch(createErrorLogger('list failed', console.error))
        }}
      >
        List
      </button>
    </div>
  )
}

test('list locations', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/location?size=10&skip=0',
    response: locationListResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListLocationsHelper
        size={10}
        onResult={onResult}
        onError={() => undefined}
      />
    </StoreProvider>,
  )
  expect(getByText('Uninitialized')).toBeDefined()

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(locationListResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(locationListResponse))).toBeDefined()
  })
  expect(getByText('Initialized')).toBeDefined()
  expect(getByText('Not fetching')).toBeDefined()
})

test('fail to list locations', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/location?size=20&skip=0',
    response: { error: 'Nope' },
    status: 500,
  })

  const onResult = vitest.fn()
  const onError = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <ListLocationsHelper size={20} onResult={onResult} onError={onError} />
    </StoreProvider>,
  )
  // The size is not the one the test above asked for: a cached response is
  // served from the cache rather than from the server.
  await user.click(getByRole('button', { name: 'List' }))

  // A failed request rejects: the unwrapping is done here so that every
  // caller gets the same failure instead of an RTK Query result object.
  await waitFor(() => {
    expect(onError).toHaveBeenCalled()
  })
  expect(onResult).not.toHaveBeenCalled()
})

function SearchLocationsHelper(props: TriggerProps): React.JSX.Element {
  const { search, isFetching } = useSearchLocations()
  return (
    <div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await search('test'))
          })().catch(createErrorLogger('search failed', console.error))
        }}
      >
        Search
      </button>
    </div>
  )
}

test('search locations', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/location/search',
    response: locationListResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SearchLocationsHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(locationListResponse)
  })
  await waitFor(() => {
    expect(getByText('Not fetching')).toBeDefined()
  })
})

function CreateLocationHelper(props: TriggerProps): React.JSX.Element {
  const { create, isLoading } = useCreateLocation()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(
              await create({
                name: location.name,
              }),
            )
          })().catch(createErrorLogger('create failed', console.error))
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create location', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/location',
    response: locationResponse,
    status: 201,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateLocationHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(locationResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})

function UpdateLocationHelper(props: TriggerProps): React.JSX.Element {
  const { update, isLoading } = useUpdateLocation()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await update(location))
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update location', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/location/${locationId}`,
    response: locationResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateLocationHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(locationResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
