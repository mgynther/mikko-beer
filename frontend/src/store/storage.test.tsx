import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import {
  useCreateStorage,
  useDeleteStorage,
  useGetAnnualStorageStats,
  useGetMonthlyStorageStats,
  useGetStorage,
  useListStorages,
  useListStoragesByBeer,
  useListStoragesByBrewery,
  useListStoragesByStyle,
} from './storage'

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

const storageId = 'd5e6f708-19ab-42cd-9e3f-4a5b6c7d8e9f'
const storage = {
  id: storageId,
  beerId: 'e6f70819-abcd-43ef-8a4b-5c6d7e8f9012',
  beerName: 'Test beer',
  bestBefore: '2026-01-01T00:00:00.000Z',
  breweries: [],
  container: {
    id: 'f7081920-bcde-44fa-9b5c-6d7e8f901234',
    type: 'bottle',
    size: '0.33',
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  hasReview: false,
  styles: [],
}
const storageListResponse = { storages: [storage] }

function GetStorageHelper(): React.JSX.Element {
  const { data, isLoading } = useGetStorage(storageId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get storage', async () => {
  const expectedResponse = { storage }
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/storage/${storageId}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <GetStorageHelper />
    </StoreProvider>,
  )
  expect(getByText('Loading')).toBeDefined()

  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ListStoragesHelper(): React.JSX.Element {
  const { data, isLoading } = useListStorages()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list storages', async () => {
  const expectedResponse = storageListResponse
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/storage',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListStoragesHelper />
    </StoreProvider>,
  )
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ListStoragesByBeerHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListStoragesByBeer(props.id)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list storages by beer', async () => {
  const id = '0819abcd-ef01-4523-8a6b-7c8d9e0f1234'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${id}/storage`,
    response: storageListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListStoragesByBeerHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(storageListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ListStoragesByBreweryHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListStoragesByBrewery(props.id)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list storages by brewery', async () => {
  const id = '19abcdef-0123-4645-9b7c-8d9e0f123456'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/brewery/${id}/storage`,
    response: storageListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListStoragesByBreweryHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(storageListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function ListStoragesByStyleHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListStoragesByStyle(props.id)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list storages by style', async () => {
  const id = '2abcdef0-1234-4767-8c8d-9e0f12345678'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/style/${id}/storage`,
    response: storageListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListStoragesByStyleHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(storageListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function AnnualStatsHelper(): React.JSX.Element {
  const { data, isLoading } = useGetAnnualStorageStats()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get annual storage stats', async () => {
  const expectedResponse = { annual: [{ year: '2025', count: '12' }] }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/storage/annual-stats',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <AnnualStatsHelper />
    </StoreProvider>,
  )
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

function MonthlyStatsHelper(): React.JSX.Element {
  const { data, isLoading } = useGetMonthlyStorageStats()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('get monthly storage stats', async () => {
  const expectedResponse = {
    monthly: [{ year: '2025', month: '3', count: '4' }],
  }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/storage/monthly-stats',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <MonthlyStatsHelper />
    </StoreProvider>,
  )
  await waitFor(() => {
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
})

const createRequest = {
  beer: storage.beerId,
  bestBefore: storage.bestBefore,
  container: storage.container.id,
}

interface CreateProps {
  onResult: (result: unknown) => void
  onError: () => void
}

function CreateStorageHelper(props: CreateProps): React.JSX.Element {
  const { create, hasError, isLoading } = useCreateStorage()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            try {
              props.onResult(await create(createRequest))
            } catch {
              props.onError()
            }
          })()
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create storage', async () => {
  const user = setupUser()
  const expectedResponse = { storage }
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/storage',
    response: expectedResponse,
    status: 201,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateStorageHelper onResult={onResult} onError={() => undefined} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(expectedResponse)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
  expect(getByText('Not failed')).toBeDefined()
})

test('fail to create storage', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/storage',
    response: { error: { code: 'InvalidStorage' } },
    status: 400,
  })

  const onError = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateStorageHelper onResult={() => undefined} onError={onError} />
    </StoreProvider>,
  )

  // The creation both rejects and reports the failure, because the form that
  // called it is still open when it fails.
  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onError).toHaveBeenCalled()
  })
  await waitFor(() => {
    expect(getByText('Failed')).toBeDefined()
  })
})

function DeleteStorageHelper(props: {
  onDeleted: () => void
}): React.JSX.Element {
  const { delete: deleteStorage } = useDeleteStorage()
  return (
    <button
      type='button'
      onClick={() => {
        void (async (): Promise<void> => {
          await deleteStorage(storageId)
          props.onDeleted()
        })()
      }}
    >
      Delete
    </button>
  )
}

test('delete storage', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'DELETE',
    pathname: `/api/v1/storage/${storageId}`,
    response: undefined,
    status: 204,
  })

  const onDeleted = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <DeleteStorageHelper onDeleted={onDeleted} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    expect(onDeleted).toHaveBeenCalled()
  })
})
