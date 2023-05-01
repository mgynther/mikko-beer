import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Brewery } from '../../src/brewery/brewery'
import { AxiosResponse } from 'axios'

describe('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should create a brewery', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Koskipanimo' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(201)
    expect(res.data.brewery.name).to.equal('Koskipanimo')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.brewery).to.eql(res.data.brewery)

    const listRes = await ctx.request.get(`/api/v1/brewery?skip=0&size=100`,
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).to.equal(200)
    expect(listRes.data.breweries.length).to.equal(1)

    const searchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSk' },
      ctx.adminAuthHeaders()
    )
    expect(searchRes.status).to.equal(200)
    expect(searchRes.data.breweries.length).to.equal(1)

    const badSearchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSkJ' },
      ctx.adminAuthHeaders()
    )
    expect(badSearchRes.status).to.equal(200)
    expect(badSearchRes.data.breweries.length).to.equal(0)
  })

  it('should update a brewery', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Salami Brewing' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(201)
    expect(res.data.brewery.name).to.equal('Salami Brewing')

    const updateRes = await ctx.request.put(`/api/v1/brewery/${res.data.brewery.id}`,
      { name: 'Salama Brewing' },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).to.equal(200)
    expect(updateRes.data.brewery.name).to.equal('Salama Brewing')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.brewery).to.eql(updateRes.data.brewery)
  })

  it('should fail to create a brewery without name', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      {},
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(400)
  })

  it('should get empty brewery list', async () => {
    const res = await ctx.request.get(`/api/v1/brewery`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(200)
    expect(res.data.breweries.length).to.equal(0)
  })

})
