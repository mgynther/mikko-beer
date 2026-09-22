import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import {
  useCreateBeer,
  useGetBeer,
  useListBeers,
  useSearchBeers,
  useUpdateBeer,
} from './beer'
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

const beerId = 'ac2a8f6a-0e23-4f3f-8d7e-9b0ad2e0d6d7'
const beer = {
  id: beerId,
  name: 'Test beer',
  breweries: ['4ac09f7f-9f5c-4d2f-b2b2-4dd2b2ac8f1a'],
  styles: ['59f2a0f2-3f51-4f6b-9c1a-7f1e2a9a9d3f'],
}
const beerResponse = { beer }
const beerListResponse = { beers: [beer] }

function GetBeerHelper(props: { beerId: string }): React.JSX.Element {
  const { data, isLoading } = useGetBeer(props.beerId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get beer', async () => {
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${beerId}`,
    response: beerResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetBeerHelper beerId={beerId} />
    </StoreProvider>,
  )
  expect(getByText('Loading')).toBeDefined()

  await waitFor(() => {
    expect(getByText(JSON.stringify(beerResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

test('get beer that does not exist', async () => {
  // A different id than the test above: a response the store has cached is
  // served from the cache, not from the server.
  const missingId = 'b4f4a3d2-1c0e-4f5a-9b8c-7d6e5f4a3b2c'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${missingId}`,
    response: { error: { code: 'BeerNotFound', message: 'not found' } },
    status: 404,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetBeerHelper beerId={missingId} />
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

function ListBeersHelper(props: ListProps): React.JSX.Element {
  const { list, data, isFetching, isUninitialized } = useListBeers()
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

test('list beers', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/beer?size=10&skip=0',
    response: beerListResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListBeersHelper
        size={10}
        onResult={onResult}
        onError={() => undefined}
      />
    </StoreProvider>,
  )
  expect(getByText('Uninitialized')).toBeDefined()

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(beerListResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(beerListResponse))).toBeDefined()
  })
  expect(getByText('Initialized')).toBeDefined()
  expect(getByText('Not fetching')).toBeDefined()
})

test('fail to list beers', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/beer?size=20&skip=0',
    response: { error: 'Nope' },
    status: 500,
  })

  const onResult = vitest.fn()
  const onError = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <ListBeersHelper size={20} onResult={onResult} onError={onError} />
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

function SearchBeersHelper(props: TriggerProps): React.JSX.Element {
  const { search, isFetching } = useSearchBeers()
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

test('search beers', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/beer/search',
    response: beerListResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SearchBeersHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Search' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(beerListResponse)
  })
  await waitFor(() => {
    expect(getByText('Not fetching')).toBeDefined()
  })
})

function CreateBeerHelper(props: TriggerProps): React.JSX.Element {
  const { create, isLoading } = useCreateBeer()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(
              await create({
                name: beer.name,
                breweries: beer.breweries,
                styles: beer.styles,
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

test('create beer', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/beer',
    response: beerResponse,
    status: 201,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateBeerHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(beerResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})

function UpdateBeerHelper(props: TriggerProps): React.JSX.Element {
  const { update, isLoading } = useUpdateBeer()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await update(beer))
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update beer', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/beer/${beerId}`,
    response: beerResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateBeerHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(beerResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
