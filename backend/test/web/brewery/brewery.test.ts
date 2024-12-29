import { expect } from 'earl'

import { TestContext } from '../test-context'
import { Brewery } from '../../../src/core/brewery/brewery'

describe('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('create a brewery', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Koskipanimo' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(201)
    expect(res.data.brewery.name).toEqual('Koskipanimo')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.brewery).toEqual(res.data.brewery)

    const listRes = await ctx.request.get(`/api/v1/brewery?skip=0&size=100`,
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).toEqual(200)
    expect(listRes.data.breweries.length).toEqual(1)

    const searchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSk' },
      ctx.adminAuthHeaders()
    )
    expect(searchRes.status).toEqual(200)
    expect(searchRes.data.breweries.length).toEqual(1)

    const badSearchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSkJ' },
      ctx.adminAuthHeaders()
    )
    expect(badSearchRes.status).toEqual(200)
    expect(badSearchRes.data.breweries.length).toEqual(0)
  })

  it('update a brewery', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Salami Brewing' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(201)
    expect(res.data.brewery.name).toEqual('Salami Brewing')

    const updateRes = await ctx.request.put(`/api/v1/brewery/${res.data.brewery.id}`,
      { name: 'Salama Brewing' },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)
    expect(updateRes.data.brewery.name).toEqual('Salama Brewing')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.brewery).toEqual(updateRes.data.brewery)
  })

  it('fail to create a brewery without name', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      {},
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(400)
  })

  it('get empty brewery list', async () => {
    const res = await ctx.request.get(`/api/v1/brewery`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.breweries.length).toEqual(0)
  })

})
