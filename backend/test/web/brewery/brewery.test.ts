import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import { Brewery } from '../../../src/core/brewery/brewery'
import { assertDeepEqual } from '../../assert'

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

    assert.equal(res.status, 201)
    assert.equal(res.data.brewery.name, 'Koskipanimo')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assertDeepEqual(getRes.data.brewery, res.data.brewery)

    const listRes = await ctx.request.get(`/api/v1/brewery?skip=0&size=100`,
      ctx.adminAuthHeaders()
    )
    assert.equal(listRes.status, 200)
    assert.equal(listRes.data.breweries.length, 1)

    const searchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSk' },
      ctx.adminAuthHeaders()
    )
    assert.equal(searchRes.status, 200)
    assert.equal(searchRes.data.breweries.length, 1)

    const badSearchRes = await ctx.request.post(`/api/v1/brewery/search`,
      { name: 'oSkJ' },
      ctx.adminAuthHeaders()
    )
    assert.equal(badSearchRes.status, 200)
    assert.equal(badSearchRes.data.breweries.length, 0)
  })

  it('update a brewery', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      { name: 'Salami Brewing' },
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 201)
    assert.equal(res.data.brewery.name, 'Salami Brewing')

    const updateRes = await ctx.request.put(`/api/v1/brewery/${res.data.brewery.id}`,
      { name: 'Salama Brewing' },
      ctx.adminAuthHeaders()
    )
    assert.equal(updateRes.status, 200)
    assert.equal(updateRes.data.brewery.name, 'Salama Brewing')

    const getRes = await ctx.request.get<{ brewery: Brewery }>(
      `/api/v1/brewery/${res.data.brewery.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assertDeepEqual(getRes.data.brewery, updateRes.data.brewery)
  })

  it('fail to create a brewery without name', async () => {
    const res = await ctx.request.post(`/api/v1/brewery`,
      {},
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 400)
  })

  it('get empty brewery list', async () => {
    const res = await ctx.request.get(`/api/v1/brewery`,
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 200)
    assert.equal(res.data.breweries.length, 0)
  })

})
