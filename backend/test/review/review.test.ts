import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Review } from '../../src/review/review'
import { Style } from '../../src/style/style'
import { AxiosResponse } from 'axios'

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(authToken: string) {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek' },
      ctx.createAuthHeaders(authToken)
    )
    expect(styleRes.status).to.equal(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.createAuthHeaders(authToken)
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.createAuthHeaders(authToken)
    )

    expect(beerRes.status).to.equal(201)
    expect(beerRes.data.beer.name).to.equal('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).to.eql([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).to.eql([styleRes.data.style.id])

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      ctx.createAuthHeaders(authToken)
    )

    return {
      beerRes,
      breweryRes,
      containerRes,
      styleRes,
    }
  }

  it('should create a review', async () => {
    const { user, authToken } = await ctx.createUser()

    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(authToken)

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        additionalInfo: 'From Belgium',
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: 'Pikilinna',
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.createAuthHeaders(authToken)
    )
    expect(reviewRes.status).to.equal(201)
    expect(reviewRes.data.review.additionalInfo).to.equal('From Belgium')
    expect(reviewRes.data.review.beer).to.equal(beerRes.data.beer.id)
    expect(reviewRes.data.review.container).to.equal(containerRes.data.container.id)
    expect(reviewRes.data.review.location).to.equal('Pikilinna')
    expect(reviewRes.data.review.rating).to.equal(8)
    expect(reviewRes.data.review.smell).to.equal('Cherries')
    expect(reviewRes.data.review.taste).to.equal('Cherries, a little sour')
    expect(reviewRes.data.review.time).to.equal('2023-03-07T18:31:33.123Z')

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.review.id).to.equal(reviewRes.data.review.id)
    expect(getRes.data.review.additionalInfo).to.equal('From Belgium')
    expect(getRes.data.review.beer).to.equal(beerRes.data.beer.id)
    expect(getRes.data.review.container).to.equal(containerRes.data.container.id)
    expect(getRes.data.review.location).to.equal('Pikilinna')
    expect(getRes.data.review.rating).to.equal(8)
    expect(getRes.data.review.smell).to.equal('Cherries')
    expect(getRes.data.review.taste).to.equal('Cherries, a little sour')
    expect(getRes.data.review.time).to.equal('2023-03-07T18:31:33.123Z')

    const listRes = await ctx.request.get<{ reviews: Review[] }>(
      '/api/v1/review/',
      ctx.createAuthHeaders(authToken)
    )
    expect(listRes.status).to.equal(200)
    expect(listRes.data.reviews.length).to.equal(1)
    expect(listRes.data.reviews[0]).to.eql(getRes.data.review)
  })

  it('should fail create a review without beer', async () => {
    const { user, authToken } = await ctx.createUser()

    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(authToken)

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        additionalInfo: 'From Belgium',
        container: containerRes.data.container.id,
        location: 'Pikilinna',
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.createAuthHeaders(authToken)
    )
    expect(reviewRes.status).to.equal(400)
  })

  it('should update a review', async () => {
    const { user, authToken } = await ctx.createUser()

    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(authToken)

    const requestData = {
      additionalInfo: 'From Belgium',
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: 'Pikilinna',
      rating: 8,
      smell: 'Cherries',
      taste: 'Crerries, a little sour',
      time: '2023-03-07T18:31:33.123Z'
    }

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      requestData, ctx.createAuthHeaders(authToken)
    )
    expect(reviewRes.status).to.equal(201)
    expect(reviewRes.data.review.taste).to.equal('Crerries, a little sour')

    const updateRes = await ctx.request.put(`/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.124Z'
      },
      ctx.createAuthHeaders(authToken)
    )
    expect(updateRes.status).to.equal(200)

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.review.taste).to.equal('Cherries, a little sour')
    expect(getRes.data.review.time).to.equal('2023-03-07T18:31:33.124Z')
  })

  it('should get empty review list', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get(`/api/v1/review`,
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)
    expect(res.data.reviews.length).to.equal(0)
  })

  function withoutParents(style: Style) {
    return {
      id: style.id,
      name: style.name
    }
  }

})
