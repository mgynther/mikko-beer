import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import { Container } from '../../../src/core/container/container'

describe('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('create a container', async () => {
    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 201)
    assert.equal(res.data.container.type, 'Bottle')
    assert.equal(res.data.container.size, '0.33')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${res.data.container.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.container.id, res.data.container.id)
    assert.equal(getRes.data.container.type, res.data.container.type)
    assert.equal(getRes.data.container.size, res.data.container.size)
  })

  it('fail to create a container as viewer', async () => {
    const { authToken } = await ctx.createUser()
    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.createAuthHeaders(authToken)
    )

    assert.equal(res.status, 403)
  })

  it('fail to create a container without type', async () => {
    const res = await ctx.request.post(`/api/v1/container`,
      { size: '0.20' },
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 400)
  })

  it('update a container', async () => {
    const createRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Draught', size: '1.00' },
      ctx.adminAuthHeaders()
    )
    assert.equal(createRes.status, 201)
    assert.equal(createRes.data.container.type, 'Draught')
    assert.equal(createRes.data.container.size, '1.00')

    const updateRes = await ctx.request.put(`/api/v1/container/${createRes.data.container.id}`,
      { type: 'Draught', size: '0.10' },
      ctx.adminAuthHeaders()
    )
    assert.equal(updateRes.status, 200)
    assert.equal(updateRes.data.container.type, 'Draught')
    assert.equal(updateRes.data.container.size, '0.10')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${createRes.data.container.id}`,
      ctx.adminAuthHeaders()
    )

    assert.equal(getRes.status, 200)
    assert.equal(getRes.data.container.id, updateRes.data.container.id)
    assert.equal(getRes.data.container.type, updateRes.data.container.type)
    assert.equal(getRes.data.container.size, updateRes.data.container.size)
  })

  it('get empty container list', async () => {
    const res = await ctx.request.get(`/api/v1/container`,
      ctx.adminAuthHeaders()
    )

    assert.equal(res.status, 200)
    assert.equal(res.data.containers.length, 0)
  })

})
