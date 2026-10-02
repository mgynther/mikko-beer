import { test } from '../test'
import { assertCalledWith, assertDefined } from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import { setupUser } from '../user-event'

import { createStoreProvider } from '../../src/store/provider'
import type {
  IdFilteredListReviewParams,
  ListReviewParams,
  ReviewListFilter,
  ReviewSorting,
} from '../../src/store/internal/review/requests'
import {
  useCreateReview,
  useGetReview,
  useListReviews,
  useListReviewsByBeer,
  useListReviewsByBrewery,
  useListReviewsByLocation,
  useListReviewsByStyle,
  useUpdateReview,
} from '../../src/store/review'
import { createErrorLogger } from '../error-logger'

// See store/beer.test.tsx for what the store layer's tests are for and why
// the helpers render the data as text.
const reviewId = 'e6f70819-abcd-43ef-8a4b-5c6d7e8f9012'
const review = {
  id: reviewId,
  additionalInfo: 'Test additional info',
  beer: 'f7081920-bcde-44fa-9b5c-6d7e8f901234',
  container: '08192031-cdef-450b-8c6d-7e8f90123456',
  location: '19203142-def0-461c-9d7e-8f9012345678',
  rating: 8,
  smell: 'Test smell',
  taste: 'Test taste',
  time: '2026-03-12T00:00:00.000Z',
}
const reviewListResponse = { reviews: [review], sorting: { order: 'time' } }

const sorting: ReviewSorting = { order: 'time', direction: 'desc' }
const filter: ReviewListFilter = {
  minRating: 4,
  maxRating: 10,
  minTime: 1,
  maxTime: 2,
}
const filterSearch =
  `order=${sorting.order}&direction=${sorting.direction}` +
  `&min_rating=${filter.minRating}&max_rating=${filter.maxRating}` +
  `&min_time=${filter.minTime}&max_time=${filter.maxTime}`

function byParams(id: string): IdFilteredListReviewParams {
  return { filter, id, sorting }
}

interface TriggerProps {
  onResult: (result: unknown) => void
}

function GetReviewHelper(props: TriggerProps): React.JSX.Element {
  const { get } = useGetReview()
  return (
    <button
      type='button'
      onClick={() => {
        ;(async (): Promise<void> => {
          props.onResult(await get(reviewId))
        })().catch(createErrorLogger('get failed', console.error))
      }}
    >
      Get
    </button>
  )
}

test('get review', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/review/${reviewId}`,
    response: { review },
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole } = render(
    <StoreProvider>
      <GetReviewHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Get' }))
  await waitFor(() => {
    assertCalledWith(onResult, [{ review }])
  })
})

function ListReviewsHelper(props: TriggerProps): React.JSX.Element {
  const { list, data, isFetching, isUninitialized } = useListReviews()
  const params: ListReviewParams = {
    filter,
    pagination: { size: 10, skip: 0 },
    sorting,
  }
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      <div>{isFetching ? 'Fetching' : 'Not fetching'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await list(params))
          })().catch(createErrorLogger('list failed', console.error))
        }}
      >
        List
      </button>
    </div>
  )
}

test('list reviews', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/review?size=10&skip=0&${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListReviewsHelper onResult={onResult} />
    </StoreProvider>,
  )
  assertDefined(getByText('Uninitialized'))

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    assertCalledWith(onResult, [reviewListResponse])
  })
  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(reviewListResponse)))
  })
  assertDefined(getByText('Not fetching'))
})

function ListReviewsByBeerHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListReviewsByBeer(byParams(props.id))
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list reviews by beer', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const id = '20314254-ef01-4723-8e8f-901234567890'
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByBeerHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(reviewListResponse)))
  })
  assertDefined(getByText('Not loading'))
})

function ListReviewsByBreweryHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListReviewsByBrewery(byParams(props.id))
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list reviews by brewery', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const id = '31425365-f012-4834-9f90-123456789012'
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/brewery/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByBreweryHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(reviewListResponse)))
  })
  assertDefined(getByText('Not loading'))
})

function ListReviewsByLocationHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListReviewsByLocation(byParams(props.id))
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list reviews by location', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const id = '42536476-0123-4945-8a01-234567890123'
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByLocationHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(reviewListResponse)))
  })
  assertDefined(getByText('Not loading'))
})

function ListReviewsByStyleHelper(props: { id: string }): React.JSX.Element {
  const { data, isLoading } = useListReviewsByStyle(byParams(props.id))
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list reviews by style', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const id = '53647587-1234-4a56-9b12-345678901234'
  server.addResponse({
    method: 'GET',
    pathname: `/api/v1/style/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByStyleHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(reviewListResponse)))
  })
  assertDefined(getByText('Not loading'))
})

function CreateReviewHelper(props: { storageId: string }): React.JSX.Element {
  const { create, data, isLoading, isSuccess } = useCreateReview()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          create({
            body: {
              additionalInfo: review.additionalInfo,
              beer: review.beer,
              container: review.container,
              location: review.location,
              rating: review.rating,
              smell: review.smell,
              taste: review.taste,
              time: review.time,
            },
            storageId: props.storageId,
          }).catch(createErrorLogger('create failed', console.error))
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create review', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const storageId = '64758698-2345-4b67-8c23-456789012345'
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/review?storage=${storageId}`,
    response: { review },
    status: 201,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateReviewHelper storageId={storageId} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertDefined(getByText('Succeeded'))
  })
  assertDefined(getByText(JSON.stringify({ review })))
  assertDefined(getByText('Not loading'))
})

test('create review without storage', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/review',
    response: { review },
    status: 201,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateReviewHelper storageId='' />
    </StoreProvider>,
  )

  // An empty storage id is a review that was not made from a storage, and the
  // url carries no storage parameter at all.
  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertDefined(getByText('Succeeded'))
  })
})

function UpdateReviewHelper(props: TriggerProps): React.JSX.Element {
  const { update, isLoading } = useUpdateReview()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onResult(await update(review))
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update review', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'PUT',
    pathname: `/api/v1/review/${reviewId}`,
    response: { review },
    status: 200,
  })

  const onResult = mockFunction<[result: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateReviewHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalledWith(onResult, [{ review }])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
  })
})
