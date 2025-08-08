import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import { Beer, BeerWithBreweriesAndStyles } from '../../../src/core/beer/beer'
import { Style } from '../../../src/core/style/style'

describe('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createBeer () {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(styleRes.status, 201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    assert.equal(breweryRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    assert.equal(beerRes.status, 201)
    assert.equal(beerRes.data.beer.name, 'Lindemans Kriek')
    assert.deepEqual(beerRes.data.beer.breweries, [breweryRes.data.brewery.id])
    assert.deepEqual(beerRes.data.beer.styles, [styleRes.data.style.id])

    return { beerRes, breweryRes, styleRes }
  }

  it('create a beer', async () => {
    const { beerRes, breweryRes, styleRes } = await createBeer()

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.beer.id, beerRes.data.beer.id)
    assert.equal(getRes.data.beer.name, beerRes.data.beer.name)
    assert.deepEqual(getRes.data.beer.breweries, [breweryRes.data.brewery])
    assert.deepEqual(getRes.data.beer.styles, [withoutParents(styleRes.data.style)])
  })

  it('fail to find beer that does not exist', async () => {
    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/e733fe0f-3b6a-438c-85cf-021987bec5f6`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 404)
  })

  it('search beer', async () => {
    const { beerRes } = await createBeer()
    const searchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: 'iNd' },
      ctx.adminAuthHeaders()
    )
    assert.equal(searchRes.status, 200)
    assert.equal(searchRes.data.beers.length, 1)
    assert.equal(searchRes.data.beers[0].id, beerRes.data.beer.id)
  })

  it('fail to find beer without a match', async () => {
    await createBeer()
    const searchNoMatchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: 'iNda' },
      ctx.adminAuthHeaders()
    )
    assert.equal(searchNoMatchRes.status, 200)
    assert.equal(searchNoMatchRes.data.beers.length, 0)
  })

  it('find beer with exact match', async () => {
    const { beerRes } = await createBeer()
    const searchExactRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: '"lindemans kriek"' },
      ctx.adminAuthHeaders()
    )
    assert.equal(searchExactRes.status, 200)
    assert.equal(searchExactRes.data.beers.length, 1)
    assert.equal(searchExactRes.data.beers[0].id, beerRes.data.beer.id)
  })

  it('not find beer with exact match mismatch', async () => {
    await createBeer()
    const searchExactNoMatchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: '"lindemans krie"' },
      ctx.adminAuthHeaders()
    )
    assert.equal(searchExactNoMatchRes.status, 200)
    assert.equal(searchExactNoMatchRes.data.beers.length, 0)
  })

  it('create a child beer with 2 breweries and 2 styles', async () => {
    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(style1Res.status, 201)

    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(style2Res.status, 201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Rock Paper Scissors' },
      ctx.adminAuthHeaders()
    )
    assert.equal(brewery1Res.status, 201)

    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.adminAuthHeaders()
    )
    assert.equal(brewery2Res.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Imaginary Wild IPA', breweries: [brewery1Res.data.brewery.id, brewery2Res.data.brewery.id], styles: [style1Res.data.style.id, style2Res.data.style.id] },
      ctx.adminAuthHeaders()
    )

    assert.equal(beerRes.status, 201)
    assert.equal(beerRes.data.beer.name, 'Imaginary Wild IPA')
    assert.deepEqual(beerRes.data.beer.styles, [style1Res.data.style.id, style2Res.data.style.id])
    assert.deepEqual(beerRes.data.beer.breweries, [brewery1Res.data.brewery.id, brewery2Res.data.brewery.id])

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.beer.id, beerRes.data.beer.id)
    assert.equal(getRes.data.beer.name, beerRes.data.beer.name)
    assert.deepEqual(getRes.data.beer.breweries, [brewery1Res.data.brewery, brewery2Res.data.brewery])
    assert.deepEqual(getRes.data.beer.styles, [withoutParents(style1Res.data.style), withoutParents(style2Res.data.style)])
  })

  it('list beers', async () => {
    await createBeer()
    const listRes = await ctx.request.get(`/api/v1/beer`,
      ctx.adminAuthHeaders()
    )

    assert.equal(listRes.status, 200)
    assert.equal(listRes.data.beers.length, 1)

    const skippedListRes = await ctx.request.get(`/api/v1/beer?size=30&skip=50`,
      ctx.adminAuthHeaders()
    )

    assert.equal(skippedListRes.status, 200)
    assert.equal(skippedListRes.data.beers.length, 0)
  })

  it('fail to create a beer with invalid style', async () => {
    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.adminAuthHeaders()
    )
    assert.equal(breweryRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: [breweryRes.data.brewery.id], styles: ['35454d45-9deb-46f2-935a-be7a7c9c9b99']},
      ctx.adminAuthHeaders()
    )

    assert.equal(beerRes.status, 400)
  })

  it('fail to create a beer with invalid brewery', async () => {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(styleRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: ['4f0acbb2-4c91-4a31-a665-6b3d345bc83d'], styles: [styleRes.data.style.id]},
      ctx.adminAuthHeaders()
    )

    assert.equal(beerRes.status, 400)
  })

  it('fail to create a beer without name', async () => {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(styleRes.status, 201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    assert.equal(breweryRes.status, 201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    assert.equal(beerRes.status, 400)
  })

  it('update a beer', async () => {
    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(style1Res.status, 201)
    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assert.equal(style2Res.status, 201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    assert.equal(brewery1Res.status, 201)
    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Sierra Nevada' },
      ctx.adminAuthHeaders()
    )
    assert.equal(brewery2Res.status, 201)

    const createRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemasn Kriek', breweries: [brewery1Res.data.brewery.id], styles: [style1Res.data.style.id] },
      ctx.adminAuthHeaders()
    )
    assert.equal(createRes.status, 201)

    const updateRes = await ctx.request.put(`/api/v1/beer/${createRes.data.beer.id}`,
      { name: 'Torpedo', breweries: [brewery2Res.data.brewery.id], styles: [style2Res.data.style.id] },
      ctx.adminAuthHeaders()
    )
    assert.equal(updateRes.status, 200)

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${createRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.beer.id, updateRes.data.beer.id)
    assert.equal(getRes.data.beer.name, updateRes.data.beer.name)
    assert.deepEqual(getRes.data.beer.breweries, [brewery2Res.data.brewery])
    assert.deepEqual(getRes.data.beer.styles, [withoutParents(style2Res.data.style)])
  })

  it('get empty beer list', async () => {
    const res = await ctx.request.get(`/api/v1/beer`,
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 200)
    assert.equal(res.data.beers.length, 0)
  })

  function withoutParents(style: Style) {
    return {
      id: style.id,
      name: style.name
    }
  }

})
