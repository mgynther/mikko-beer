import { expect } from 'earl'

import { TestContext } from '../test-context'
import { Beer, BeerWithBreweriesAndStyles } from '../../../src/core/beer'
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
    expect(styleRes.status).toEqual(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemans Kriek', breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(beerRes.status).toEqual(201)
    expect(beerRes.data.beer.name).toEqual('Lindemans Kriek')
    expect(beerRes.data.beer.breweries).toEqual([breweryRes.data.brewery.id])
    expect(beerRes.data.beer.styles).toEqual([styleRes.data.style.id])

    return { beerRes, breweryRes, styleRes }
  }

  it('create a beer', async () => {
    const { beerRes, breweryRes, styleRes } = await createBeer()

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.beer.id).toEqual(beerRes.data.beer.id)
    expect(getRes.data.beer.name).toEqual(beerRes.data.beer.name)
    expect(getRes.data.beer.breweries).toEqual([breweryRes.data.brewery])
    expect(getRes.data.beer.styles).toEqual([withoutParents(styleRes.data.style)])
  })

  it('fail to find beer that does not exist', async () => {
    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/e733fe0f-3b6a-438c-85cf-021987bec5f6`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(404)
  })

  it('search beer', async () => {
    const { beerRes } = await createBeer()
    const searchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: 'iNd' },
      ctx.adminAuthHeaders()
    )
    expect(searchRes.status).toEqual(200)
    expect(searchRes.data.beers.length).toEqual(1)
    expect(searchRes.data.beers[0].id).toEqual(beerRes.data.beer.id)
  })

  it('fail to find beer without a match', async () => {
    await createBeer()
    const searchNoMatchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: 'iNda' },
      ctx.adminAuthHeaders()
    )
    expect(searchNoMatchRes.status).toEqual(200)
    expect(searchNoMatchRes.data.beers.length).toEqual(0)
  })

  it('find beer with exact match', async () => {
    const { beerRes } = await createBeer()
    const searchExactRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: '"lindemans kriek"' },
      ctx.adminAuthHeaders()
    )
    expect(searchExactRes.status).toEqual(200)
    expect(searchExactRes.data.beers.length).toEqual(1)
    expect(searchExactRes.data.beers[0].id).toEqual(beerRes.data.beer.id)
  })

  it('not find beer with exact match mismatch', async () => {
    await createBeer()
    const searchExactNoMatchRes = await ctx.request.post<{ beers: Beer[] }>(
      '/api/v1/beer/search',
      { name: '"lindemans krie"' },
      ctx.adminAuthHeaders()
    )
    expect(searchExactNoMatchRes.status).toEqual(200)
    expect(searchExactNoMatchRes.data.beers.length).toEqual(0)
  })

  it('create a child beer with 2 breweries and 2 styles', async () => {
    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(style1Res.status).toEqual(201)

    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(style2Res.status).toEqual(201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Rock Paper Scissors' },
      ctx.adminAuthHeaders()
    )
    expect(brewery1Res.status).toEqual(201)

    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.adminAuthHeaders()
    )
    expect(brewery2Res.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Imaginary Wild IPA', breweries: [brewery1Res.data.brewery.id, brewery2Res.data.brewery.id], styles: [style1Res.data.style.id, style2Res.data.style.id] },
      ctx.adminAuthHeaders()
    )

    expect(beerRes.status).toEqual(201)
    expect(beerRes.data.beer.name).toEqual('Imaginary Wild IPA')
    expect(beerRes.data.beer.styles).toEqual([style1Res.data.style.id, style2Res.data.style.id])
    expect(beerRes.data.beer.breweries).toEqual([brewery1Res.data.brewery.id, brewery2Res.data.brewery.id])

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${beerRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.beer.id).toEqual(beerRes.data.beer.id)
    expect(getRes.data.beer.name).toEqual(beerRes.data.beer.name)
    expect(getRes.data.beer.breweries).toEqual([brewery1Res.data.brewery, brewery2Res.data.brewery])
    expect(getRes.data.beer.styles).toEqual([withoutParents(style1Res.data.style), withoutParents(style2Res.data.style)])
  })

  it('list beers', async () => {
    await createBeer()
    const listRes = await ctx.request.get(`/api/v1/beer`,
      ctx.adminAuthHeaders()
    )

    expect(listRes.status).toEqual(200)
    expect(listRes.data.beers.length).toEqual(1)

    const skippedListRes = await ctx.request.get(`/api/v1/beer?size=30&skip=50`,
      ctx.adminAuthHeaders()
    )

    expect(skippedListRes.status).toEqual(200)
    expect(skippedListRes.data.beers.length).toEqual(0)
  })

  it('fail to create a beer with invalid style', async () => {
    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Brewcats' },
      ctx.adminAuthHeaders()
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: [breweryRes.data.brewery.id], styles: ['35454d45-9deb-46f2-935a-be7a7c9c9b99']},
      ctx.adminAuthHeaders()
    )

    expect(beerRes.status).toEqual(400)
  })

  it('fail to create a beer with invalid brewery', async () => {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(styleRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Random IPA', breweries: ['4f0acbb2-4c91-4a31-a665-6b3d345bc83d'], styles: [styleRes.data.style.id]},
      ctx.adminAuthHeaders()
    )

    expect(beerRes.status).toEqual(400)
  })

  it('fail to create a beer without name', async () => {
    const styleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(styleRes.status).toEqual(201)

    const breweryRes = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post(`/api/v1/beer`,
      { breweries: [breweryRes.data.brewery.id], styles: [styleRes.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(beerRes.status).toEqual(400)
  })

  it('update a beer', async () => {
    const style1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(style1Res.status).toEqual(201)
    const style2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(style2Res.status).toEqual(201)

    const brewery1Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Lindemans' },
      ctx.adminAuthHeaders()
    )
    expect(brewery1Res.status).toEqual(201)
    const brewery2Res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Sierra Nevada' },
      ctx.adminAuthHeaders()
    )
    expect(brewery2Res.status).toEqual(201)

    const createRes = await ctx.request.post(`/api/v1/beer`,
      { name: 'Lindemasn Kriek', breweries: [brewery1Res.data.brewery.id], styles: [style1Res.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(createRes.status).toEqual(201)

    const updateRes = await ctx.request.put(`/api/v1/beer/${createRes.data.beer.id}`,
      { name: 'Torpedo', breweries: [brewery2Res.data.brewery.id], styles: [style2Res.data.style.id] },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)

    const getRes = await ctx.request.get<{ beer: BeerWithBreweriesAndStyles }>(
      `/api/v1/beer/${createRes.data.beer.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.beer.id).toEqual(updateRes.data.beer.id)
    expect(getRes.data.beer.name).toEqual(updateRes.data.beer.name)
    expect(getRes.data.beer.breweries).toEqual([brewery2Res.data.brewery])
    expect(getRes.data.beer.styles).toEqual([withoutParents(style2Res.data.style)])
  })

  it('get empty beer list', async () => {
    const res = await ctx.request.get(`/api/v1/beer`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.beers.length).toEqual(0)
  })

  function withoutParents(style: Style) {
    return {
      id: style.id,
      name: style.name
    }
  }

})
