import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  CreateReviewRequest,
  FilteredReviewListBody,
  ListReviewsByIdRequest,
  ListReviewsRequest,
  ListedReview,
  ReadReviewBody,
  ReviewBody,
  ReviewHandlers,
  ReviewListBody,
  ReviewListQuery,
} from '../../src/web/review/review.js'
import type { IdBodyRequest, IdRequest } from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const reviewId = '2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a'
const beerId = '5f0c1b5e-6a4f-4d4e-9f0e-2b6a1b0f7c11'
const breweryId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'
const locationId = '8e9f0a1b-2c3d-4e5f-8a6b-7c8d9e0f1a2b'
const styleId = '9a4b8c6d-1e2f-4a3b-8c5d-6e7f8a9b0c1d'
const containerId = '3b9f2a1c-7d4e-4f5a-8b6c-9d0e1f2a3b4c'
const storageId = '7c8d9e0f-1a2b-4c3d-8e4f-5a6b7c8d9e0f'

const review = {
  id: reviewId,
  additionalInfo: '',
  beer: beerId,
  container: containerId,
  location: locationId,
  rating: 8,
  time: '2026-09-01T18:00:00.000Z',
  smell: 'bready malt, grassy hops',
  taste: 'crisp, bitter finish',
}

const reviewBody: ReviewBody = { review }

const listedReview: ListedReview = {
  id: reviewId,
  additionalInfo: '',
  beerId,
  beerName: 'Pilsner Urquell',
  breweries: [{ id: breweryId, name: 'Plzeňský Prazdroj' }],
  container: { id: containerId, type: 'bottle', size: '0.50' },
  location: { id: locationId, name: 'Pivovarský dům' },
  rating: 8,
  styles: [{ id: styleId, name: 'Lager' }],
  time: '2026-09-01T18:00:00.000Z',
}

const filteredListBody: FilteredReviewListBody = {
  reviews: [listedReview],
  sorting: { order: 'rating', direction: 'desc' },
}

const requestBody = {
  additionalInfo: '',
  beer: beerId,
  container: containerId,
  location: locationId,
  rating: 8,
  time: '2026-09-01T18:00:00.000Z',
  smell: 'bready malt, grassy hops',
  taste: 'crisp, bitter finish',
}

const listQueryString =
  'order=rating&direction=desc&min_rating=6&max_rating=9' +
  '&min_time=1767225600000&max_time=1798761600000'

const listQuery: ReviewListQuery = {
  order: 'rating',
  direction: 'desc',
  minRating: '6',
  maxRating: '9',
  minTime: '1767225600000',
  maxTime: '1798761600000',
}

const noListQuery: ReviewListQuery = {
  order: undefined,
  direction: undefined,
  minRating: undefined,
  maxRating: undefined,
  minTime: undefined,
  maxTime: undefined,
}

function listByIdMock() {
  return mockFunction<
    [request: ListReviewsByIdRequest],
    Promise<FilteredReviewListBody>
  >(async () => filteredListBody)
}

type ListById =
  'listByBeer' | 'listByBrewery' | 'listByLocation' | 'listByStyle'

suite('review routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a review', async () => {
    const create = mockFunction<
      [request: CreateReviewRequest],
      Promise<ReviewBody>
    >(async () => reviewBody)
    await server.start({ review: { create } })

    const res = await server.request.post(
      '/api/v1/review',
      requestBody,
      headers,
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, reviewBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody, storage: undefined }]],
    )
  })

  test('create a review from storage', async () => {
    const create = mockFunction<
      [request: CreateReviewRequest],
      Promise<ReviewBody>
    >(async () => reviewBody)
    await server.start({ review: { create } })

    await server.request.post(
      `/api/v1/review?storage=${storageId}`,
      requestBody,
      headers,
    )

    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody, storage: storageId }]],
    )
  })

  test('update a review', async () => {
    const update = mockFunction<[request: IdBodyRequest], Promise<ReviewBody>>(
      async () => reviewBody,
    )
    await server.start({ review: { update } })

    const res = await server.request.put(
      `/api/v1/review/${reviewId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, reviewBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: reviewId, body: requestBody }]],
    )
  })

  test('find a review', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadReviewBody>>(
      async () => ({ review }),
    )
    await server.start({ review: { find } })

    const res = await server.request.get(`/api/v1/review/${reviewId}`, headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { review })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: reviewId }]],
    )
  })

  const listsById: Array<{ name: ListById; path: string; id: string }> = [
    { name: 'listByBeer', path: `/api/v1/beer/${beerId}/review`, id: beerId },
    {
      name: 'listByBrewery',
      path: `/api/v1/brewery/${breweryId}/review`,
      id: breweryId,
    },
    {
      name: 'listByLocation',
      path: `/api/v1/location/${locationId}/review`,
      id: locationId,
    },
    {
      name: 'listByStyle',
      path: `/api/v1/style/${styleId}/review`,
      id: styleId,
    },
  ]

  listsById.forEach(({ name, path, id }) => {
    test(`${name} with the list query`, async () => {
      const listById = listByIdMock()
      const handlers: Partial<ReviewHandlers> = { [name]: listById }
      await server.start({ review: handlers })

      const res = await server.request.get(
        `${path}?${listQueryString}`,
        headers,
      )

      assertEqual(res.status, 200)
      assertDeepEqual(res.data, filteredListBody)
      assertDeepEqual(
        listById.mock.calls.map((call) => call.arguments),
        [[{ authorization, id, list: listQuery }]],
      )
    })
  })

  test('list reviews by beer without a list query', async () => {
    const listByBeer = listByIdMock()
    await server.start({ review: { listByBeer } })

    await server.request.get(`/api/v1/beer/${beerId}/review`, headers)

    assertDeepEqual(
      listByBeer.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: beerId, list: noListQuery }]],
    )
  })

  test('list reviews', async () => {
    const listBody: ReviewListBody = {
      reviews: [listedReview],
      pagination: { size: 20, skip: 40 },
      sorting: { order: 'rating', direction: 'desc' },
    }
    const list = mockFunction<
      [request: ListReviewsRequest],
      Promise<ReviewListBody>
    >(async () => listBody)
    await server.start({ review: { list } })

    const res = await server.request.get(
      `/api/v1/review?size=20&skip=40&${listQueryString}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [
        [
          {
            authorization,
            pagination: { size: '20', skip: '40' },
            list: listQuery,
          },
        ],
      ],
    )
  })
})
