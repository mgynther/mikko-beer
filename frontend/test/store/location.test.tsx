import { test } from '../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import { setupUser } from '../user-event'

import { createStoreProvider } from '../../src/store/provider'
import {
  useCreateLocation,
  useGetLocation,
  useListLocations,
  useSearchLocations,
  useUpdateLocation,
} from '../../src/store/location'
import { createErrorLogger } from '../error-logger'

// The store layer is where the requests are real: these tests drive the test
// server and prove that a public function asks for the right url with the
// right method and gives the response back untouched. What the response means
// is the validation layer's business and what is done with it is the
// storehooks'.
//
// The data is unknown here, so the helpers render it as text rather than
// reaching into it. That is the whole point of the type.
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${locationId}`,
    response: locationResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <GetLocationHelper locationId={locationId} />
    </StoreProvider>,
  )
  assertDefined(getByText('Loading'))

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(locationResponse)))
  })
  assertDefined(getByText('Not loading'))
})

test('get location that does not exist', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const missingId = 'd6b6c5f4-3e2a-4b7c-9d0e-1f2a3b4c5d6e'
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${missingId}`,
    response: { error: { code: 'LocationNotFound', message: 'not found' } },
    status: 404,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <GetLocationHelper locationId={missingId} />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
  // A failed request has no data to give.
  assertDefined(getByText('No data'))
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'GET',
    pathname: '/api/v1/location?size=10&skip=0',
    response: locationListResponse,
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListLocationsHelper
        size={10}
        onResult={onResult}
        onError={() => undefined}
      />
    </StoreProvider>,
  )
  assertDefined(getByText('Uninitialized'))

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    assertCalledWith(onResult, [locationListResponse])
  })
  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(locationListResponse)))
  })
  assertDefined(getByText('Initialized'))
  assertDefined(getByText('Not fetching'))
})

test('fail to list locations', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'GET',
    pathname: '/api/v1/location?size=20&skip=0',
    response: { error: 'Nope' },
    status: 500,
  })

  const onResult = mockFunction<[result: unknown]>()
  const onError = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole } = render(
    <StoreProvider>
      <ListLocationsHelper size={20} onResult={onResult} onError={onError} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'List' }))

  // A failed request rejects: the unwrapping is done here so that every
  // caller gets the same failure instead of an RTK Query result object.
  await waitFor(() => {
    assertCalled(onError)
  })
  assertCallCount(onResult, 0)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/location/search',
    response: locationListResponse,
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SearchLocationsHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    assertCalledWith(onResult, [locationListResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not fetching'))
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/location',
    response: locationResponse,
    status: 201,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateLocationHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onResult, [locationResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'PUT',
    pathname: `/api/v1/location/${locationId}`,
    response: locationResponse,
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateLocationHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalledWith(onResult, [locationResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})
