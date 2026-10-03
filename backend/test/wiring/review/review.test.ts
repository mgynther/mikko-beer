import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { ReviewRequest } from '../../../src/logic/review/review.js'
import type {
  FilteredReviewListBody,
  ListedReview,
  ReadReviewBody,
  ReviewBody,
  ReviewListBody,
} from '../../../src/web/review/review.js'
import type {
  CreatedOrUpdatedStorage,
  ReadStorage,
} from '../../../src/web/storage/storage.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedContainer } from '../../../src/web/container/container.js'
import type { CreatedOrUpdatedLocation } from '../../../src/web/location/location.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'

interface Names {
  beer: string
  brewery: string
  style: string
  location: string
}

// A beer with what a review of it lists along with it.
interface ReviewableBeer {
  beer: CreatedOrUpdatedBeer
  brewery: CreatedOrUpdatedBrewery
  style: CreatedOrUpdatedStyle
  location: CreatedOrUpdatedLocation
}

const lindemansKriek: Names = {
  beer: 'Lindemans Kriek',
  brewery: 'Lindemans',
  style: 'Kriek',
  location: 'Pikilinna',
}

const nokianIpa: Names = {
  beer: 'Nokian IPA',
  brewery: 'Nokian Panimo',
  style: 'IPA',
  location: 'Oluthuone',
}

function reviewRequest(
  { beer, location }: ReviewableBeer,
  container: CreatedOrUpdatedContainer,
): ReviewRequest {
  return {
    additionalInfo: 'From Belgium',
    beer: beer.id,
    container: container.id,
    location: location.id,
    rating: 8,
    smell: 'Cherries',
    taste: 'Cherries, a little sour',
    time: '2023-03-07T18:31:33.123Z',
  }
}

function listed(
  { beer, brewery, style, location }: ReviewableBeer,
  container: CreatedOrUpdatedContainer,
  review: ReviewBody['review'],
): ListedReview {
  return {
    id: review.id,
    additionalInfo: review.additionalInfo,
    beerId: beer.id,
    beerName: beer.name,
    breweries: [{ id: brewery.id, name: brewery.name }],
    container,
    location: { id: location.id, name: location.name },
    rating: review.rating,
    styles: [{ id: style.id, name: style.name }],
    time: review.time,
  }
}

suite('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createContainer(): Promise<CreatedOrUpdatedContainer> {
    const res = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.container
  }

  async function createBeer(names: Names): Promise<ReviewableBeer> {
    const [styleRes, breweryRes, locationRes] = await Promise.all([
      ctx.request.post<{ style: CreatedOrUpdatedStyle }>(
        `/api/v1/style`,
        { name: names.style, parents: [] },
        ctx.adminAuthHeaders(),
      ),
      ctx.request.post<{ brewery: CreatedOrUpdatedBrewery }>(
        `/api/v1/brewery`,
        { name: names.brewery },
        ctx.adminAuthHeaders(),
      ),
      ctx.request.post<{ location: CreatedOrUpdatedLocation }>(
        `/api/v1/location`,
        { name: names.location },
        ctx.adminAuthHeaders(),
      ),
    ])
    assertEqual(styleRes.status, 201)
    assertEqual(breweryRes.status, 201)
    assertEqual(locationRes.status, 201)

    const beerRes = await ctx.request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: names.beer,
        breweries: [breweryRes.data.brewery.id],
        styles: [styleRes.data.style.id],
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(beerRes.status, 201)

    return {
      beer: beerRes.data.beer,
      brewery: breweryRes.data.brewery,
      style: styleRes.data.style,
      location: locationRes.data.location,
    }
  }

  async function createReview(
    request: ReviewRequest,
  ): Promise<ReviewBody['review']> {
    const res = await ctx.request.post<ReviewBody>(
      `/api/v1/review`,
      request,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.review
  }

  test('create a review', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const request = reviewRequest(beer, container)

    const res = await ctx.request.post<ReviewBody>(
      `/api/v1/review`,
      request,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, {
      review: { ...request, id: res.data.review.id },
    })
  })

  test('create a review from storage and delete the storage', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const storageRes = await ctx.request.post<{
      storage: CreatedOrUpdatedStorage
    }>(
      `/api/v1/storage`,
      {
        bestBefore: '2024-10-01T00:00:00.000Z',
        beer: beer.beer.id,
        container: container.id,
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(storageRes.status, 201)

    const reviewRes = await ctx.request.post<ReviewBody>(
      `/api/v1/review?storage=${storageRes.data.storage.id}`,
      reviewRequest(beer, container),
      ctx.adminAuthHeaders(),
    )
    assertEqual(reviewRes.status, 201)

    const getStorageRes = await ctx.request.get<{ storage: ReadStorage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(getStorageRes.status, 404)
  })

  test('find a review', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const review = await createReview(reviewRequest(beer, container))

    const res = await ctx.request.get<ReadReviewBody>(
      `/api/v1/review/${review.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { review })
  })

  test('update a review', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const request = reviewRequest(beer, container)
    const review = await createReview(request)
    const update: ReviewRequest = {
      ...request,
      rating: 9,
      taste: 'Sour cherries',
      time: '2023-03-08T18:31:33.123Z',
    }

    const res = await ctx.request.put<ReviewBody>(
      `/api/v1/review/${review.id}`,
      update,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { review: { ...update, id: review.id } })
  })

  test('list reviews', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const review = await createReview(reviewRequest(beer, container))

    const res = await ctx.request.get<ReviewListBody>(
      '/api/v1/review?size=10&skip=0&order=rating&direction=asc',
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      reviews: [listed(beer, container, review)],
      pagination: { size: 10, skip: 0 },
      sorting: { order: 'rating', direction: 'asc' },
    })
  })

  const listsById: Array<{
    name: string
    path: (beer: ReviewableBeer) => string
  }> = [
    { name: 'beer', path: ({ beer }) => `beer/${beer.id}` },
    { name: 'brewery', path: ({ brewery }) => `brewery/${brewery.id}` },
    { name: 'location', path: ({ location }) => `location/${location.id}` },
    { name: 'style', path: ({ style }) => `style/${style.id}` },
  ]

  listsById.forEach(({ name, path }) =>
    test(`list reviews by ${name}`, async () => {
      const [kriek, ipa, container] = await Promise.all([
        createBeer(lindemansKriek),
        createBeer(nokianIpa),
        createContainer(),
      ])
      const [kriekReview] = await Promise.all([
        createReview(reviewRequest(kriek, container)),
        createReview(reviewRequest(ipa, container)),
      ])

      const res = await ctx.request.get<FilteredReviewListBody>(
        `/api/v1/${path(kriek)}/review?order=beer_name&direction=desc`,
        ctx.adminAuthHeaders(),
      )

      assertEqual(res.status, 200)
      assertDeepEqual(res.data, {
        reviews: [listed(kriek, container, kriekReview)],
        sorting: { order: 'beer_name', direction: 'desc' },
      })
    }),
  )
})
