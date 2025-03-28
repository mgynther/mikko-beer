import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { ListDirection } from '../../../src/core/list'
import type {
  JoinedReview,
  Review,
  ReviewListOrderProperty,
  ReviewRequest
} from '../../../src/core/review/review'

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
    expect(styleRes.status).toEqual(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    expect(beerRes.status).toEqual(201)
    expect(beerRes.data.beer.name).toEqual('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).toEqual([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).toEqual([styleRes.data.style.id])

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )

    const locationRes = await ctx.request.post(`/api/v1/location`,
      { name: 'Pikilinna' },
      adminAuthHeaders
    )
    expect(locationRes.status).toEqual(201)

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
    expect(reviewRes.status).toEqual(201)
    expect(reviewRes.data.review.additionalInfo).toEqual('From Belgium')
    expect(reviewRes.data.review.beer).toEqual(beerRes.data.beer.id)
    expect(reviewRes.data.review.container).toEqual(containerRes.data.container.id)
    expect(reviewRes.data.review.location).toEqual(locationRes.data.location.id)
    expect(reviewRes.data.review.rating).toEqual(8)
    expect(reviewRes.data.review.smell).toEqual('Cherries')
    expect(reviewRes.data.review.taste).toEqual('Cherries, a little sour')
    expect(reviewRes.data.review.time).toEqual('2023-03-07T18:31:33.123Z')

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.review.id).toEqual(reviewRes.data.review.id)
    expect(getRes.data.review.additionalInfo).toEqual('From Belgium')
    expect(getRes.data.review.beer).toEqual(beerRes.data.beer.id)
    expect(getRes.data.review.container).toEqual(containerRes.data.container.id)
    expect(reviewRes.data.review.location).toEqual(locationRes.data.location.id)
    expect(getRes.data.review.rating).toEqual(8)
    expect(getRes.data.review.smell).toEqual('Cherries')
    expect(getRes.data.review.taste).toEqual('Cherries, a little sour')
    expect(getRes.data.review.time.toString()).toEqual('2023-03-07T18:31:33.123Z')

    const listRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      '/api/v1/review/',
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).toEqual(200)
    expect(listRes.data.reviews.length).toEqual(1)
    expect(listRes.data.reviews[0].id).toEqual(getRes.data.review.id)
    expect(listRes.data.reviews[0].beerId).toEqual(getRes.data.review.beer)
    expect(listRes.data.reviews[0].container).toEqual(containerRes.data.container)
    expect(listRes.data.reviews[0].breweries[0]).toEqual(breweryRes.data.brewery)
    const parentlessStyle = { ...styleRes.data.style }
    delete parentlessStyle.parents
    expect(listRes.data.reviews[0].styles[0]).toEqual(parentlessStyle)

    const skippedListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      '/api/v1/review?size=50&skip=30',
      ctx.adminAuthHeaders()
    )
    expect(skippedListRes.status).toEqual(200)
    expect(skippedListRes.data.reviews.length).toEqual(0)

    const breweryListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/review/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).toEqual(200)
    expect(breweryListRes.data.reviews.length).toEqual(1)
    expect(breweryListRes.data.reviews[0].id).toEqual(getRes.data.review.id)
    expect(breweryListRes.data.reviews[0].beerId).toEqual(getRes.data.review.beer)

    const styleListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/style/${styleRes.data.style.id}/review/`,
      ctx.adminAuthHeaders()
    )
    expect(styleListRes.status).toEqual(200)
    expect(styleListRes.data.reviews.length).toEqual(1)
    expect(styleListRes.data.reviews[0].id).toEqual(getRes.data.review.id)
    expect(styleListRes.data.reviews[0].beerId).toEqual(getRes.data.review.beer)

    const beerListRes = await ctx.request.get<{ reviews: JoinedReview[] }>(
      `/api/v1/beer/${beerRes.data.beer.id}/review/`,
      ctx.adminAuthHeaders()
    )
    expect(beerListRes.status).toEqual(200)
    expect(beerListRes.data.reviews).toEqual(breweryListRes.data.reviews)
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
    expect(reviewRes.status).toEqual(400)
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
    expect(reviewRes.status).toEqual(400)
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
    expect(storageRes.status).toEqual(201)
    expect(storageRes.data.storage.beer).toEqual(beerRes.data.beer.id)

    const reviewRes = await ctx.request.post(`/api/v1/review?storage=${storageRes.data.storage.id}`,
      {
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: locationRes.data.location.id,
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).toEqual(201)
    expect(reviewRes.data.review.beer).toEqual(beerRes.data.beer.id)

    const getStorageRes = await ctx.request.get<{ storage: Storage }>(
      `/api/v1/storage/${storageRes.data.storage.id}`,
      ctx.adminAuthHeaders()
    )
    expect(getStorageRes.status).toEqual(404)
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
    expect(reviewRes.status).toEqual(400)
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
    expect(reviewRes.status).toEqual(400)
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
    expect(reviewRes.status).toEqual(201)
    expect(reviewRes.data.review.taste).toEqual('Crerries, a little sour')

    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.124Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.review.taste).toEqual('Cherries, a little sour')
    expect(getRes.data.review.time.toString()).toEqual('2023-03-07T18:31:33.124Z')
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
    expect(reviewRes.status).toEqual(201)
    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        beer: 'b06a997e-d073-4878-860f-63839596ebd6'
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(400)
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
    expect(reviewRes.status).toEqual(201)
    const updateRes = await ctx.request.put(
      `/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        container: 'a7ae5013-9556-4fec-95bc-21cfc69bd92c'
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(400)
  })

  it('get empty review list', async () => {
    const res = await ctx.request.get(`/api/v1/review`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.reviews.length).toEqual(0)
  })

  async function createListDeps(adminAuthHeaders: Record<string, unknown>) {
    const { beerRes, breweryRes, containerRes, locationRes, styleRes } =
      await createDeps(adminAuthHeaders)

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: locationRes.data.location.id,
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).toEqual(201)
    expect(reviewRes.data.review.beer).toEqual(beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).toEqual(201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).toEqual(201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(otherBeerRes.status).toEqual(201)
    expect(otherBeerRes.data.beer.name).toEqual('IPA')
    expect(otherBeerRes.data.beer.breweries).toEqual([otherBreweryRes.data.brewery.id])
    expect(otherBeerRes.data.beer.styles).toEqual([otherStyleRes.data.style.id])

    const otherReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: otherBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: locationRes.data.location.id,
        rating: 7,
        smell: 'Grapefruit',
        taste: 'Bitter',
        time: '2023-03-10T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(otherReviewRes.status).toEqual(201)
    expect(otherReviewRes.data.review.beer).toEqual(otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(collabBeerRes.status).toEqual(201)
    expect(collabBeerRes.data.beer.name).toEqual('Wild Kriek IPA')

    const collabReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: '',
        rating: 6,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-09T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(collabReviewRes.status).toEqual(201)
    expect(collabReviewRes.data.review.beer).toEqual(collabBeerRes.data.beer.id)

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
    expect(breweryListRes.status).toEqual(200)
    expect(breweryListRes.data.reviews.length).toEqual(2)

    const kriekReview = breweryListRes.data.reviews[1]
    expect(kriekReview?.id).toEqual(reviewRes.data.review.id)
    expect(kriekReview?.beerId).toEqual(reviewRes.data.review.beer)

    const collabReview = breweryListRes.data.reviews[0]
    expect(collabReview?.id).toEqual(collabReviewRes.data.review.id)
    expect(collabReview?.beerId).toEqual(collabReviewRes.data.review.beer)
    expect(collabReview?.breweries?.length).toEqual(2)

    const sorting = breweryListRes.data.sorting
    expect(sorting.order).toEqual('beer_name')
    expect(sorting.direction).toEqual('desc')
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
    expect(locationListRes.status).toEqual(200)
    expect(locationListRes.data.reviews.length).toEqual(2)

    const kriekReview = locationListRes.data.reviews[0]
    expect(kriekReview?.id).toEqual(reviewRes.data.review.id)
    expect(kriekReview?.beerId).toEqual(reviewRes.data.review.beer)

    const otherReview = locationListRes.data.reviews[1]
    expect(otherReview?.id).toEqual(otherReviewRes.data.review.id)
    expect(otherReview?.beerId).toEqual(otherReviewRes.data.review.beer)

    const sorting = locationListRes.data.sorting
    expect(sorting.order).toEqual('beer_name')
    expect(sorting.direction).toEqual('desc')
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
    expect(styleListRes.status).toEqual(200)
    expect(styleListRes.data.reviews.length).toEqual(2)

    const kriekReview = styleListRes.data.reviews[1]
    expect(kriekReview?.id).toEqual(reviewRes.data.review.id)
    expect(kriekReview?.beerId).toEqual(reviewRes.data.review.beer)

    const collabReview = styleListRes.data.reviews[0]
    expect(collabReview?.id).toEqual(collabReviewRes.data.review.id)
    expect(collabReview?.beerId).toEqual(collabReviewRes.data.review.beer)
    expect(collabReview?.breweries?.length).toEqual(2)

    const sorting = styleListRes.data.sorting
    expect(sorting.order).toEqual('beer_name')
    expect(sorting.direction).toEqual('desc')
  })

  it('list reviews by beer', async () => {
    const { beerRes, containerRes, locationRes } =
      await createDeps(ctx.adminAuthHeaders())

    const reviewBase = {
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      smell: 'Cherries',
      taste: 'Cherries, a little sour',
    }

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        ...reviewBase,
        rating: 8,
        time: '2023-03-08T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).toEqual(201)

    const otherReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        ...reviewBase,
        rating: 7,
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(otherReviewRes.status).toEqual(201)

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
    expect(beerListRes.status).toEqual(200)
    expect(beerListRes.data.reviews.length).toEqual(2)
    expect(beerListRes.data.reviews.map(r => r.rating)).toEqual([7, 8])
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
    expect(listRes.status).toEqual(200)
    expect(listRes.data.reviews.length).toEqual(3)

    const kriekReview = listRes.data.reviews[data.kriekIndex]
    expect(kriekReview?.time).toEqual(reviewRes.data.review.time)
    expect(kriekReview?.id).toEqual(reviewRes.data.review.id)
    expect(kriekReview?.beerId).toEqual(reviewRes.data.review.beer)

    const otherReview = listRes.data.reviews[data.otherIndex]
    expect(otherReview?.time).toEqual(otherReviewRes.data.review.time)
    expect(otherReview?.id).toEqual(otherReviewRes.data.review.id)
    expect(otherReview?.beerId).toEqual(otherReviewRes.data.review.beer)

    const collabReview = listRes.data.reviews[data.collabIndex]
    expect(collabReview?.time).toEqual(collabReviewRes.data.review.time)
    expect(collabReview?.id).toEqual(collabReviewRes.data.review.id)
    expect(collabReview?.beerId).toEqual(collabReviewRes.data.review.beer)
    expect(collabReview?.breweries?.length).toEqual(2)

    expect(listRes.data.sorting).toEqual(data.sorting)
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
