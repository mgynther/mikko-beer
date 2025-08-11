import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { ListDirection } from '../../../src/core/list'
import type {
  CreateReviewRequest,
  JoinedReview,
  Review,
  ReviewListOrderProperty,
  ReviewRequest
} from '../../../src/core/review/review'
import { assertDeepEqual, assertEqual } from '../../assert'

const createNewReviewRequest = (
  beerId: string,
  containerId: string,
  locationId: string
): ReviewRequest => ({
  additionalInfo: 'From Belgium',
  beer: beerId,
  container: containerId,
  location: locationId,
  rating: 8,
  smell: 'Cherries',
  taste: 'Cherries, a little sour',
  time: '2023-03-07T18:31:33.123Z'
})

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      adminAuthHeaders
    )
    assertEqual(styleRes.status, 201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    assertEqual(breweryRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    assertEqual(beerRes.status, 201)
    assertEqual(beerRes.data.beer.name, 'Lindemans Kriek')
    assertDeepEqual(beerRes.data.beer.breweries, [breweryRes.data.brewery.id])
    assertDeepEqual(beerRes.data.beer.styles, [styleRes.data.style.id])

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )

    const locationRes = await ctx.request.post(`/api/v1/location`,
      { name: 'Pikilinna' },
      adminAuthHeaders
    )
    assertEqual(locationRes.status, 201)

    return {
      beerRes,
      breweryRes,
      containerRes,
      locationRes,
      styleRes,
    }
  }

  it('create a review', async () => {
    const { beerRes, breweryRes, containerRes, locationRes, styleRes } =
      await createDeps(ctx.adminAuthHeaders())

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      createNewReviewRequest(
        beerRes.data.beer.id,
        containerRes.data.container.id,
        locationRes.data.location.id
      ),
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    assertEqual(reviewRes.data.review.additionalInfo, 'From Belgium')
    assertEqual(reviewRes.data.review.beer, beerRes.data.beer.id)
    assertEqual(reviewRes.data.review.container, containerRes.data.container.id)
    assertEqual(reviewRes.data.review.location, locationRes.data.location.id)
    assertEqual(reviewRes.data.review.rating, 8)
    assertEqual(reviewRes.data.review.smell, 'Cherries')
    assertEqual(reviewRes.data.review.taste, 'Cherries, a little sour')
    assertEqual(reviewRes.data.review.time, '2023-03-07T18:31:33.123Z')

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.review.id, reviewRes.data.review.id)
    assertEqual(getRes.data.review.additionalInfo, 'From Belgium')
    assertEqual(getRes.data.review.beer, beerRes.data.beer.id)
    assertEqual(getRes.data.review.container, containerRes.data.container.id)
    assertEqual(reviewRes.data.review.location, locationRes.data.location.id)
    assertEqual(getRes.data.review.rating, 8)
    assertEqual(getRes.data.review.smell, 'Cherries')
    assertEqual(getRes.data.review.taste, 'Cherries, a little sour')
    assertEqual(getRes.data.review.time.toString(), '2023-03-07T18:31:33.123Z')

    const listRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      '/api/v1/review/',
      ctx.adminAuthHeaders()
    )
    assertEqual(listRes.status, 200)
    assertEqual(listRes.data.reviews.length, 1)
    assertEqual(listRes.data.reviews[0].id, getRes.data.review.id)
    assertEqual(listRes.data.reviews[0].beerId, getRes.data.review.beer)
    assertDeepEqual(listRes.data.reviews[0].container, containerRes.data.container)
    assertDeepEqual(listRes.data.reviews[0].breweries[0], breweryRes.data.brewery)
    const parentlessStyle = { ...styleRes.data.style }
    delete parentlessStyle.parents
    assertDeepEqual(listRes.data.reviews[0].styles[0], parentlessStyle)

    const skippedListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      '/api/v1/review?size=50&skip=30',
      ctx.adminAuthHeaders()
    )
    assertEqual(skippedListRes.status, 200)
    assertEqual(skippedListRes.data.reviews.length, 0)

    const breweryListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/review/`,
      ctx.adminAuthHeaders()
    )
    assertEqual(breweryListRes.status, 200)
    assertEqual(breweryListRes.data.reviews.length, 1)
    assertEqual(breweryListRes.data.reviews[0].id, getRes.data.review.id)
    assertEqual(breweryListRes.data.reviews[0].beerId, getRes.data.review.beer)

    const styleListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/style/${styleRes.data.style.id}/review/`,
      ctx.adminAuthHeaders()
    )
    assertEqual(styleListRes.status, 200)
    assertEqual(styleListRes.data.reviews.length, 1)
    assertEqual(styleListRes.data.reviews[0].id, getRes.data.review.id)
    assertEqual(styleListRes.data.reviews[0].beerId, getRes.data.review.beer)

    const beerListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/beer/${beerRes.data.beer.id}/review/`,
      ctx.adminAuthHeaders()
    )
    assertEqual(beerListRes.status, 200)
    assertDeepEqual(beerListRes.data.reviews, breweryListRes.data.reviews)
  })

  it('fail to create a review with invalid beer', async () => {
    const { containerRes } = await createDeps(ctx.adminAuthHeaders())

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      createNewReviewRequest(
        'bc589557-ca7d-4be3-97fb-d9369c7c6c3c',
        containerRes.data.container.id,
        ''
      ),
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 400)
  })

  it('fail to create a review with invalid container', async () => {
    const { beerRes } = await createDeps(ctx.adminAuthHeaders())

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      createNewReviewRequest(
        beerRes.data.beer.id,
        '645d27c8-3a7b-416f-8174-3baa68bb4f38',
        ''
      ),
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 400)
  })

  it('delete storage when review created from storage', async () => {
    const { beerRes, containerRes, locationRes } =
      await createDeps(ctx.adminAuthHeaders())

    const bestBefore = '2024-10-01T00:00:00.000Z'
    const storageRes = await ctx.request.post(`/api/v1/storage`,
      {
        bestBefore,
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(storageRes.status, 201)
    assertEqual(storageRes.data.storage.beer, beerRes.data.beer.id)

    const createReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 8,
      smell: 'Cherries',
      taste: 'Cherries, a little sour',
      time: '2023-03-07T18:31:33.123Z'
    }
    const reviewRes = await ctx.request.post(`/api/v1/review?storage=${storageRes.data.storage.id}`,
      createReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    assertEqual(reviewRes.data.review.beer, beerRes.data.beer.id)

    const getStorageRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(getStorageRes.status, 404)
  })

  it('fail to create review with invalid storage', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const dummyId = 'b6c2c801-d8a5-4a13-98bb-32cfb9611359'
    const reviewRes = await ctx.request.post(`/api/v1/review?storage=${dummyId}`,
      createNewReviewRequest(
        beerRes.data.beer.id,
        containerRes.data.container.id,
        ''
      ),
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 400)
  })

  it('fail to create a review without beer', async () => {
    const { containerRes } = await createDeps(ctx.adminAuthHeaders())

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        additionalInfo: 'From Belgium',
        container: containerRes.data.container.id,
        location: '',
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 400)
  })

  it('update review', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const requestData = {
      ...createNewReviewRequest(
        beerRes.data.beer.id,
        containerRes.data.container.id,
        ''
      ),
      taste: 'Crerries, a little sour'
    }

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      requestData, ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    assertEqual(reviewRes.data.review.taste, 'Crerries, a little sour')

    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.124Z'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(updateRes.status, 200)

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.review.taste, 'Cherries, a little sour')
    assertEqual(getRes.data.review.time.toString(), '2023-03-07T18:31:33.124Z')
  })

  it('fail to update review with invalid beer', async () => {
    const { beerRes, containerRes } = await createDeps(ctx.adminAuthHeaders())

    const requestData = createNewReviewRequest(
      beerRes.data.beer.id,
      containerRes.data.container.id,
      ''
    )

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      requestData, ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        beer: 'b06a997e-d073-4878-860f-63839596ebd6'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(updateRes.status, 400)
  })

  it('fail to update review with invalid container', async () => {
    const { beerRes, containerRes, locationRes } =
      await createDeps(ctx.adminAuthHeaders())

    const requestData = createNewReviewRequest(
      beerRes.data.beer.id,
      containerRes.data.container.id,
      locationRes.data.location.id
    )

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      requestData, ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        container: 'a7ae5013-9556-4fec-95bc-21cfc69bd92c'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(updateRes.status, 400)
  })

  it('get empty review list', async () => {
    const res = await ctx.request.get(`/api/v1/review`,
      ctx.adminAuthHeaders()
    )

    assertEqual(res.status, 200)
    assertEqual(res.data.reviews.length, 0)
  })

  async function createListDeps(adminAuthHeaders: Record<string, unknown>) {
    const { beerRes, breweryRes, containerRes, locationRes, styleRes } =
      await createDeps(adminAuthHeaders)

    const createReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 8,
      smell: 'Cherries',
      taste: 'Cherries, a little sour',
      time: '2023-03-07T18:31:33.123Z'
    }
    const reviewRes = await ctx.request.post(`/api/v1/review`,
      createReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)
    assertEqual(reviewRes.data.review.beer, beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherStyleRes.status, 201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherBreweryRes.status, 201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    assertEqual(otherBeerRes.status, 201)
    assertEqual(otherBeerRes.data.beer.name, 'IPA')
    assertDeepEqual(otherBeerRes.data.beer.breweries, [otherBreweryRes.data.brewery.id])
    assertDeepEqual(otherBeerRes.data.beer.styles, [otherStyleRes.data.style.id])

    const createOtherReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: otherBeerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 7,
      smell: 'Grapefruit',
      taste: 'Bitter',
      time: '2023-03-10T18:31:33.123Z'
    }
    const otherReviewRes = await ctx.request.post(`/api/v1/review`,
      createOtherReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(otherReviewRes.status, 201)
    assertEqual(otherReviewRes.data.review.beer, otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    assertEqual(collabBeerRes.status, 201)
    assertEqual(collabBeerRes.data.beer.name, 'Wild Kriek IPA')

    const createCollabReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: collabBeerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: '',
      rating: 6,
      smell: 'Grapefruit, cherries',
      taste: 'Bitter, sour',
      time: '2023-03-09T18:31:33.123Z'
    }
    const collabReviewRes = await ctx.request.post(`/api/v1/review`,
      createCollabReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(collabReviewRes.status, 201)
    assertEqual(collabReviewRes.data.review.beer, collabBeerRes.data.beer.id)

    return {
      beerRes,
      breweryRes,
      containerRes,
      locationRes,
      styleRes,
      reviewRes,
      collabReviewRes,
      otherReviewRes
    }
  }

  it('list reviews by brewery', async () => {
    const { breweryRes, reviewRes, collabReviewRes } = await createListDeps(ctx.adminAuthHeaders())

    const breweryListRes = await ctx.request.get<{
      reviews: JoinedReview[],
      sorting: {
        order: ReviewListOrderProperty,
        direction: ListDirection
      }
    }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/review?order=beer_name&direction=desc`,
      ctx.adminAuthHeaders()
    )
    assertEqual(breweryListRes.status, 200)
    assertEqual(breweryListRes.data.reviews.length, 2)

    const kriekReview = breweryListRes.data.reviews[1]
    assertEqual(kriekReview?.id, reviewRes.data.review.id)
    assertEqual(kriekReview?.beerId, reviewRes.data.review.beer)

    const collabReview = breweryListRes.data.reviews[0]
    assertEqual(collabReview?.id, collabReviewRes.data.review.id)
    assertEqual(collabReview?.beerId, collabReviewRes.data.review.beer)
    assertEqual(collabReview?.breweries?.length, 2)

    const sorting = breweryListRes.data.sorting
    assertEqual(sorting.order, 'beer_name')
    assertEqual(sorting.direction, 'desc')
  })

  it('list reviews by location', async () => {
    const { locationRes, reviewRes, otherReviewRes } =
      await createListDeps(ctx.adminAuthHeaders())

    const locationListRes = await ctx.request.get<{
      reviews: JoinedReview[],
      sorting: {
        order: ReviewListOrderProperty,
        direction: ListDirection
      }
    }>(
      `/api/v1/location/${
        locationRes.data.location.id
      }/review?order=beer_name&direction=desc`,
      ctx.adminAuthHeaders()
    )
    assertEqual(locationListRes.status, 200)
    assertEqual(locationListRes.data.reviews.length, 2)

    const kriekReview = locationListRes.data.reviews[0]
    assertEqual(kriekReview?.id, reviewRes.data.review.id)
    assertEqual(kriekReview?.beerId, reviewRes.data.review.beer)

    const otherReview = locationListRes.data.reviews[1]
    assertEqual(otherReview?.id, otherReviewRes.data.review.id)
    assertEqual(otherReview?.beerId, otherReviewRes.data.review.beer)

    const sorting = locationListRes.data.sorting
    assertEqual(sorting.order, 'beer_name')
    assertEqual(sorting.direction, 'desc')
  })

  it('list reviews by style', async () => {
    const { styleRes, reviewRes, collabReviewRes } = await createListDeps(ctx.adminAuthHeaders())

    const styleListRes = await ctx.request.get<{
      reviews: JoinedReview[],
      sorting: {
        order: ReviewListOrderProperty,
        direction: ListDirection
      }
    }>(
      `/api/v1/style/${styleRes.data.style.id}/review?order=beer_name&direction=desc`,
      ctx.adminAuthHeaders()
    )
    assertEqual(styleListRes.status, 200)
    assertEqual(styleListRes.data.reviews.length, 2)

    const kriekReview = styleListRes.data.reviews[1]
    assertEqual(kriekReview?.id, reviewRes.data.review.id)
    assertEqual(kriekReview?.beerId, reviewRes.data.review.beer)

    const collabReview = styleListRes.data.reviews[0]
    assertEqual(collabReview?.id, collabReviewRes.data.review.id)
    assertEqual(collabReview?.beerId, collabReviewRes.data.review.beer)
    assertEqual(collabReview?.breweries?.length, 2)

    const sorting = styleListRes.data.sorting
    assertEqual(sorting.order, 'beer_name')
    assertEqual(sorting.direction, 'desc')
  })

  it('list reviews by beer', async () => {
    const { beerRes, containerRes, locationRes } =
      await createDeps(ctx.adminAuthHeaders())

    const reviewBase: CreateReviewRequest = {
      additionalInfo: 'testing',
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 4,
      smell: 'Cherries',
      taste: 'Cherries, a little sour',
      time: '2000-01-01T00:00:00.000Z'
    }

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        ...reviewBase,
        rating: 8,
        time: '2023-03-08T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)

    const otherReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        ...reviewBase,
        rating: 7,
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherReviewRes.status, 201)

    const beerListRes = await ctx.request.get<{
      reviews: JoinedReview[],
      sorting: {
        order: ReviewListOrderProperty,
        direction: ListDirection
      }
    }>(
      `/api/v1/beer/${beerRes.data.beer.id}/review?order=rating&direction=asc`,
      ctx.adminAuthHeaders()
    )
    assertEqual(beerListRes.status, 200)
    assertEqual(beerListRes.data.reviews.length, 2)
    assertDeepEqual(beerListRes.data.reviews.map(r => r.rating), [7, 8])
  })

  interface Sorting {
    order: 'rating' | 'time',
    direction: 'asc' | 'desc'
  }

  interface ListOrderTestData {
    query: string
    sorting: Sorting
    kriekIndex: number
    otherIndex: number
    collabIndex: number
  }

  async function testListOrder(adminAuthHeaders: Record<string, unknown>, data: ListOrderTestData) {
    const { reviewRes, collabReviewRes, otherReviewRes } = await createListDeps(adminAuthHeaders);
    const listRes = await ctx.request.get<{ reviews: JoinedReview[], sorting: Sorting }>(
      `/api/v1/review${data.query}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(listRes.status, 200)
    assertEqual(listRes.data.reviews.length, 3)

    const kriekReview = listRes.data.reviews[data.kriekIndex]
    assertDeepEqual(kriekReview?.time, reviewRes.data.review.time)
    assertEqual(kriekReview?.id, reviewRes.data.review.id)
    assertEqual(kriekReview?.beerId, reviewRes.data.review.beer)

    const otherReview = listRes.data.reviews[data.otherIndex]
    assertDeepEqual(otherReview?.time, otherReviewRes.data.review.time)
    assertEqual(otherReview?.id, otherReviewRes.data.review.id)
    assertEqual(otherReview?.beerId, otherReviewRes.data.review.beer)

    const collabReview = listRes.data.reviews[data.collabIndex]
    assertDeepEqual(collabReview?.time, collabReviewRes.data.review.time)
    assertEqual(collabReview?.id, collabReviewRes.data.review.id)
    assertEqual(collabReview?.beerId, collabReviewRes.data.review.beer)
    assertEqual(collabReview?.breweries?.length, 2)

    assertDeepEqual(listRes.data.sorting, data.sorting)
  }

  it('list reviews', async() => {
    await testListOrder(ctx.adminAuthHeaders(), {
      query: '',
      sorting: { order: 'time', direction: 'desc' },
      kriekIndex: 2,
      otherIndex: 0,
      collabIndex: 1
    })
  })

  it('list reviews, time', async() => {
    await testListOrder(ctx.adminAuthHeaders(), {
      query: '?order=time',
      sorting: { order: 'time', direction: 'desc' },
      kriekIndex: 2,
      otherIndex: 0,
      collabIndex: 1
    })
  })

  it('list reviews, time desc', async() => {
    await testListOrder(ctx.adminAuthHeaders(), {
      query: '?order=time&direction=desc',
      sorting: { order: 'time', direction: 'desc' },
      kriekIndex: 2,
      otherIndex: 0,
      collabIndex: 1
    })
  })

  it('list reviews, rating', async() => {
    await testListOrder(ctx.adminAuthHeaders(), {
      query: '?order=rating',
      sorting: { order: 'rating', direction: 'desc' },
      kriekIndex: 0,
      otherIndex: 1,
      collabIndex: 2
    })
  })

  it('list reviews, rating asc', async() => {
    await testListOrder(ctx.adminAuthHeaders(), {
      query: '?order=rating&direction=asc',
      sorting: { order: 'rating', direction: 'asc' },
      kriekIndex: 2,
      otherIndex: 1,
      collabIndex: 0
    })
  })
})
