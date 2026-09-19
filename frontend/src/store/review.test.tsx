import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import type {
  IdFilteredListReviewParams,
  ListReviewParams,
  ReviewListFilter,
  ReviewSorting,
} from './internal/review/requests'
import {
  useCreateReview,
  useGetReview,
  useListReviews,
  useListReviewsByBeer,
  useListReviewsByBrewery,
  useListReviewsByLocation,
  useListReviewsByStyle,
  useUpdateReview,
} from './review'

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
        void (async (): Promise<void> => {
          props.onResult(await get(reviewId))
        })()
      }}
    >
      Get
    </button>
  )
}

test('get review', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/review/${reviewId}`,
    response: { review },
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <GetReviewHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Get' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith({ review })
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
          void (async (): Promise<void> => {
            props.onResult(await list(params))
          })()
        }}
      >
        List
      </button>
    </div>
  )
}

test('list reviews', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/review?size=10&skip=0&${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <ListReviewsHelper onResult={onResult} />
    </StoreProvider>,
  )
  expect(getByText('Uninitialized')).toBeDefined()

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith(reviewListResponse)
  })
  await waitFor(() => {
    expect(getByText(JSON.stringify(reviewListResponse))).toBeDefined()
  })
  expect(getByText('Not fetching')).toBeDefined()
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
  const id = '20314254-ef01-4723-8e8f-901234567890'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/beer/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByBeerHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(reviewListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
  const id = '31425365-f012-4834-9f90-123456789012'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/brewery/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByBreweryHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(reviewListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
  const id = '42536476-0123-4945-8a01-234567890123'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/location/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByLocationHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(reviewListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
  const id = '53647587-1234-4a56-9b12-345678901234'
  server?.addResponse({
    method: 'GET',
    pathname: `/api/v1/style/${id}/review?${filterSearch}`,
    response: reviewListResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListReviewsByStyleHelper id={id} />
    </StoreProvider>,
  )

  await waitFor(() => {
    expect(getByText(JSON.stringify(reviewListResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
          void create({
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
          })
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create review', async () => {
  const user = setupUser()
  const storageId = '64758698-2345-4b67-8c23-456789012345'
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/review?storage=${storageId}`,
    response: { review },
    status: 201,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateReviewHelper storageId={storageId} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(getByText('Succeeded')).toBeDefined()
  })
  expect(getByText(JSON.stringify({ review }))).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
})

test('create review without storage', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/review',
    response: { review },
    status: 201,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateReviewHelper storageId='' />
    </StoreProvider>,
  )

  // An empty storage id is a review that was not made from a storage, and the
  // url carries no storage parameter at all.
  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(getByText('Succeeded')).toBeDefined()
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
          void (async (): Promise<void> => {
            props.onResult(await update(review))
          })()
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update review', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'PUT',
    pathname: `/api/v1/review/${reviewId}`,
    response: { review },
    status: 200,
  })

  const onResult = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <UpdateReviewHelper onResult={onResult} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onResult).toHaveBeenCalledWith({ review })
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
