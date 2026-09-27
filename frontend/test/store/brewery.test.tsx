import { beforeAll, beforeEach, afterAll, test } from '../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import type { TestServer } from './server'
import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import {
  useCreateBrewery,
  useGetBrewery,
  useListBreweries,
  useSearchBreweries,
  useUpdateBrewery,
} from '../../src/store/brewery'
import { createErrorLogger } from '../error-logger'

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

const breweryId = 'e7c7d6a5-4f3b-4c8d-a0e1-2f3a4b5c6d7e'
const brewery = {
  id: breweryId,
  name: 'Test brewery',
  country: 'Finland',
}
const breweryResponse = { brewery }
const breweryListResponse = { breweries: [brewery] }

function GetBreweryHelper(props: { breweryId: string }): React.JSX.Element {
  const { data, isLoading } = useGetBrewery(props.breweryId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get brewery', async () => {
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/brewery/${breweryId}`,
    response: breweryResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetBreweryHelper breweryId={breweryId} />
    </StoreProvider>,
  )
  assertDefined(getByText('Loading'))

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(breweryResponse)))
  })
  assertDefined(getByText('Not loading'))
})

test('get brewery that does not exist', async () => {
  // A different id than the test above: a response the store has cached is
  // served from the cache, not from the server.
  const missingId = 'c5a5b4e3-2d1f-4a6b-8c9d-0e1f2a3b4c5d'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/brewery/${missingId}`,
    response: { error: { code: 'BreweryNotFound', message: 'not found' } },
    status: 404,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetBreweryHelper breweryId={missingId} />
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

function ListBreweriesHelper(props: ListProps): React.JSX.Element {
  const { list, data, isFetching, isUninitialized } = useListBreweries()
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

test('list breweries', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/brewery?size=10&skip=0',
    response: breweryListResponse,
    status: 200,
  })

  const onResult = mockFunction()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListBreweriesHelper
        size={10}
        onResult={onResult}
        onError={() => undefined}
      />
    </StoreProvider>,
  )
  assertDefined(getByText('Uninitialized'))

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    assertCalledWith(onResult, [breweryListResponse])
  })
  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(breweryListResponse)))
  })
  assertDefined(getByText('Initialized'))
  assertDefined(getByText('Not fetching'))
})

test('fail to list breweries', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/brewery?size=20&skip=0',
    response: { error: 'Nope' },
    status: 500,
  })

  const onResult = mockFunction()
  const onError = mockFunction()
  const { getByRole } = render(
    <StoreProvider>
      <ListBreweriesHelper size={20} onResult={onResult} onError={onError} />
    </StoreProvider>,
  )
  // The size is not the one the test above asked for: a cached response is
  // served from the cache rather than from the server.
  await user.click(getByRole('button', { name: 'List' }))

  // A failed request rejects: the unwrapping is done here so that every
  // caller gets the same failure instead of an RTK Query result object.
  await waitFor(() => {
    assertCalled(onError)
  })
  assertCallCount(onResult, 0)
})

function SearchBreweriesHelper(props: TriggerProps): React.JSX.Element {
  const { search, isFetching } = useSearchBreweries()
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

test('search breweries', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/brewery/search',
    response: breweryListResponse,
    status: 200,
  })

  const onResult = mockFunction()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SearchBreweriesHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    assertCalledWith(onResult, [breweryListResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not fetching'))
  })
})

function CreateBreweryHelper(props: TriggerProps): React.JSX.Element {
  const { create, isLoading } = useCreateBrewery()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(
              await create({
                name: brewery.name,
                country: brewery.country,
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

test('create brewery', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/brewery',
    response: breweryResponse,
    status: 201,
  })

  const onResult = mockFunction()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateBreweryHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onResult, [breweryResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})

function UpdateBreweryHelper(props: TriggerProps): React.JSX.Element {
  const { update, isLoading } = useUpdateBrewery()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await update(brewery))
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update brewery', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/brewery/${breweryId}`,
    response: breweryResponse,
    status: 200,
  })

  const onResult = mockFunction()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateBreweryHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalledWith(onResult, [breweryResponse])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})
