import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Beer, BeerWithBreweriesAndStyles } from '../../src/beer/beer'
import { Style } from '../../src/style/style'
import { AxiosResponse } from 'axios'

describe('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should create a beer', async () => {
    const { user, authToken } = await ctx.createUser()

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

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.beer.id).to.equal(beerRes.data.beer.id)
    expect(getRes.data.beer.name).to.equal(beerRes.data.beer.name)
    expect(getRes.data.beer.breweries).to.eql([breweryRes.data.brewery])
    expect(getRes.data.beer.styles).to.eql([withoutParents(styleRes.data.style)])
  })

  it('should create a child beer with 2 breweries and 2 styles', async () => {
    const { user, authToken } = await ctx.createUser()

    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild' },
      ctx.createAuthHeaders(authToken)
    )
    expect(style1Res.status).to.equal(201)

    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.createAuthHeaders(authToken)
    )
    expect(style2Res.status).to.equal(201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Rock Paper Scissors' },
      ctx.createAuthHeaders(authToken)
    )
    expect(brewery1Res.status).to.equal(201)

    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.createAuthHeaders(authToken)
    )
    expect(brewery2Res.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Imaginary Wild IPA', breweries: [brewery1Res.data.brewery.id, brewery2Res.data.brewery.id], styles: [style1Res.data.style.id, style2Res.data.style.id] },
      ctx.createAuthHeaders(authToken)
    )

    expect(beerRes.status).to.equal(201)
    expect(beerRes.data.beer.name).to.equal('Imaginary Wild IPA')
    expect(beerRes.data.beer.styles).to.eql([style1Res.data.style.id, style2Res.data.style.id])
    expect(beerRes.data.beer.breweries).to.eql([brewery1Res.data.brewery.id, brewery2Res.data.brewery.id])

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.beer.id).to.equal(beerRes.data.beer.id)
    expect(getRes.data.beer.name).to.equal(beerRes.data.beer.name)
    expect(getRes.data.beer.breweries).to.eql([brewery1Res.data.brewery, brewery2Res.data.brewery])
    expect(getRes.data.beer.styles).to.eql([withoutParents(style1Res.data.style), withoutParents(style2Res.data.style)])

    const listRes = await ctx.request.get(`/api/v1/beer`,
      ctx.createAuthHeaders(authToken)
    )

    expect(listRes.status).to.equal(200)
    expect(listRes.data.beers.length).to.equal(1)
  })

  it('should fail to create a beer with invalid style', async () => {
    const { user, authToken } = await ctx.createUser()

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.createAuthHeaders(authToken)
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: [breweryRes.data.brewery.id], styles: ['35454d45-9deb-46f2-935a-be7a7c9c9b99']},
      ctx.createAuthHeaders(authToken)
    )

    // TODO It would be cleaner to report a client error.
    expect(beerRes.status).to.equal(500)
  })

  it('should fail to create a beer without style', async () => {
    const { user, authToken } = await ctx.createUser()

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.createAuthHeaders(authToken)
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: [breweryRes.data.brewery.id], styles: []},
      ctx.createAuthHeaders(authToken)
    )

    expect(beerRes.status).to.equal(400)
  })

  it('should fail to create a beer with invalid brewery', async () => {
    const { user, authToken } = await ctx.createUser()

    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.createAuthHeaders(authToken)
    )
    expect(styleRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: ['4f0acbb2-4c91-4a31-a665-6b3d345bc83d'], styles: [styleRes.data.style.id]},
      ctx.createAuthHeaders(authToken)
    )

    // TODO It would be cleaner to report a client error.
    expect(beerRes.status).to.equal(500)
  })

  it('should fail to create a beer without brewery', async () => {
    const { user, authToken } = await ctx.createUser()

    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.createAuthHeaders(authToken)
    )
    expect(styleRes.status).to.equal(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: [], styles: [styleRes.data.style.id]},
      ctx.createAuthHeaders(authToken)
    )

    expect(beerRes.status).to.equal(400)
  })

  it('should fail to create a beer without name', async () => {
    const { user, authToken } = await ctx.createUser()

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
      { breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.createAuthHeaders(authToken)
    )
    expect(beerRes.status).to.equal(400)
  })

  it('should update a beer', async () => {
    const { user, authToken } = await ctx.createUser()

    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek' },
      ctx.createAuthHeaders(authToken)
    )
    expect(style1Res.status).to.equal(201)
    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA' },
      ctx.createAuthHeaders(authToken)
    )
    expect(style2Res.status).to.equal(201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.createAuthHeaders(authToken)
    )
    expect(brewery1Res.status).to.equal(201)
    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Sierra Nevada' },
      ctx.createAuthHeaders(authToken)
    )
    expect(brewery2Res.status).to.equal(201)

    const createRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemasn Kriek', breweries: [brewery1Res.data.brewery.id], styles: [style1Res.data.style.id] },
      ctx.createAuthHeaders(authToken)
    )
    expect(createRes.status).to.equal(201)

    const updateRes = await ctx.request.put(`/api/v1/beer/${createRes.data.beer.id}`,
      { name: 'Torpedo', breweries: [brewery2Res.data.brewery.id], styles: [style2Res.data.style.id] },
      ctx.createAuthHeaders(authToken)
    )
    expect(updateRes.status).to.equal(200)

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${createRes.data.beer.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.beer.id).to.equal(updateRes.data.beer.id)
    expect(getRes.data.beer.name).to.equal(updateRes.data.beer.name)
    expect(getRes.data.beer.breweries).to.eql([brewery2Res.data.brewery])
    expect(getRes.data.beer.styles).to.eql([withoutParents(style2Res.data.style)])
  })

  it('should get empty beer list', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get(`/api/v1/beer`,
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)
    expect(res.data.beers.length).to.equal(0)
  })

  function withoutParents(style: Style) {
    return {
      id: style.id,
      name: style.name
    }
  }

})
