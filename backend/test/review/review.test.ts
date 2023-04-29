import { expect } from 'chai'

import { TestContext } from '../test-context'
import { BreweryReview, Review, ReviewBasic } from '../../src/review/review'
import { Style } from '../../src/style/style'
import { AxiosResponse } from 'axios'

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek' },
      adminAuthHeaders
    )
    expect(styleRes.status).to.equal(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      adminAuthHeaders
    )

    expect(beerRes.status).to.equal(201)
    expect(beerRes.data.beer.name).to.equal('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).to.eql([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).to.eql([styleRes.data.style.id])

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )

    return {
      beerRes,
      breweryRes,
      containerRes,
      styleRes,
    }
  }

  it('should create a review', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

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
      ctx.adminAuthHeaders()
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
      ctx.adminAuthHeaders()
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
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).to.equal(200)
    expect(listRes.data.reviews.length).to.equal(1)
    expect(listRes.data.reviews[0].id).to.eql(getRes.data.review.id)
    expect(listRes.data.reviews[0].beer).to.eql(getRes.data.review.beer)
    expect(listRes.data.reviews[0].smell).to.equal(undefined)
    expect(listRes.data.reviews[0].taste).to.equal(undefined)

    const breweryListRes = await ctx.request.get<{ reviews: BreweryReview[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/review/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).to.equal(200)
    expect(breweryListRes.data.reviews.length).to.equal(1)
    expect(breweryListRes.data.reviews[0].id).to.eql(getRes.data.review.id)
    expect(breweryListRes.data.reviews[0].beerId).to.eql(getRes.data.review.beer)
  })

  it('should fail create a review without beer', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

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
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).to.equal(400)
  })

  it('should update a review', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

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
      requestData, ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).to.equal(201)
    expect(reviewRes.data.review.taste).to.equal('Crerries, a little sour')

    const updateRes = await ctx.request.put(`/api/v1/review/${reviewRes.data.review.id}`,
      {
        ...requestData,
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.124Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).to.equal(200)

    const getRes = await ctx.request.get<{ review: Review }>(
      `/api/v1/review/${reviewRes.data.review.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.review.taste).to.equal('Cherries, a little sour')
    expect(getRes.data.review.time).to.equal('2023-03-07T18:31:33.124Z')
  })

  it('should get empty review list', async () => {
    const res = await ctx.request.get(`/api/v1/review`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(200)
    expect(res.data.reviews.length).to.equal(0)
  })

  it('should list reviews by brewery', async () => {
    const { beerRes, breweryRes, containerRes, styleRes } = await createDeps(ctx.adminAuthHeaders())

    const reviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 8,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2023-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).to.equal(201)
    expect(reviewRes.data.review.beer).to.equal(beerRes.data.beer.id)

    const otherStyleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).to.equal(201)

    const otherBreweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).to.equal(201)

    const otherBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'IPA', breweries: [otherBreweryRes.data.brewery.id], styles: [otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(otherBeerRes.status).to.equal(201)
    expect(otherBeerRes.data.beer.name).to.equal('IPA')
    expect(otherBeerRes.data.beer.breweries).to.eql([otherBreweryRes.data.brewery.id])
    expect(otherBeerRes.data.beer.styles).to.eql([otherStyleRes.data.style.id])

    const otherReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: otherBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 8,
        smell: 'Grapefruit',
        taste: 'Bitter',
        time: '2023-03-08T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(otherReviewRes.status).to.equal(201)
    expect(otherReviewRes.data.review.beer).to.equal(otherBeerRes.data.beer.id)

    const collabBeerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Wild Kriek IPA', breweries: [breweryRes.data.brewery.id, otherBreweryRes.data.brewery.id], styles: [styleRes.data.style.id, otherStyleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(collabBeerRes.status).to.equal(201)
    expect(collabBeerRes.data.beer.name).to.equal('Wild Kriek IPA')

    const collabReviewRes = await ctx.request.post(`/api/v1/review`,
      {
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 8,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-09T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(collabReviewRes.status).to.equal(201)
    expect(collabReviewRes.data.review.beer).to.equal(collabBeerRes.data.beer.id)

    const breweryListRes = await ctx.request.get<{ reviews: BreweryReview[] }>(
      `/api/v1/brewery/${breweryRes.data.brewery.id}/review/`,
      ctx.adminAuthHeaders()
    )
    expect(breweryListRes.status).to.equal(200)
    expect(breweryListRes.data.reviews.length).to.equal(2)
    const kriekReview = breweryListRes.data.reviews.find(review => review.id === reviewRes.data.review.id)
    expect(kriekReview?.id).to.eql(reviewRes.data.review.id)
    expect(kriekReview?.beerId).to.eql(reviewRes.data.review.beer)
    const collabReview = breweryListRes.data.reviews.find(review => review.id === collabReviewRes.data.review.id)
    expect(collabReview?.id).to.eql(collabReviewRes.data.review.id)
    expect(collabReview?.beerId).to.eql(collabReviewRes.data.review.beer)
    expect(collabReview?.breweries?.length).to.equal(2)
    const collabBrewery = collabReview?.breweries?.find(brewery => brewery.id === breweryRes.data.brewery.id);
    const otherCollabBrewery = collabReview?.breweries?.find(brewery => brewery.id === otherBreweryRes.data.brewery.id);
    expect(collabBrewery).to.eql({ id: breweryRes.data.brewery.id, name: breweryRes.data.brewery.name });
    expect(otherCollabBrewery).to.eql({ id: otherBreweryRes.data.brewery.id, name: otherBreweryRes.data.brewery.name });
    const collabStyle = collabReview?.styles?.find(style => style.id === styleRes.data.style.id);
    const otherCollabStyle = collabReview?.styles?.find(style => style.id === otherStyleRes.data.style.id);
    expect(collabStyle).to.eql({ id: styleRes.data.style.id, name: styleRes.data.style.name });
    expect(otherCollabStyle).to.eql({ id: otherStyleRes.data.style.id, name: otherStyleRes.data.style.name });
  })

  function withoutParents(style: Style) {
    return {
      id: style.id,
      name: style.name
    }
  }

})
