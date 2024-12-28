import { expect } from 'earl'

import { TestContext } from '../test-context'
import { Container } from '../../../src/core/container'

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

    expect(res.status).toEqual(201)
    expect(res.data.container.type).toEqual('Bottle')
    expect(res.data.container.size).toEqual('0.33')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${res.data.container.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.container.id).toEqual(res.data.container.id)
    expect(getRes.data.container.type).toEqual(res.data.container.type)
    expect(getRes.data.container.size).toEqual(res.data.container.size)
  })

  it('fail to create a container as viewer', async () => {
    const { authToken } = await ctx.createUser()
    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).toEqual(403)
  })

  it('fail to create a container without type', async () => {
    const res = await ctx.request.post(`/api/v1/container`,
      { size: '0.20' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(400)
  })

  it('update a container', async () => {
    const createRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Draught', size: '1.00' },
      ctx.adminAuthHeaders()
    )
    expect(createRes.status).toEqual(201)
    expect(createRes.data.container.type).toEqual('Draught')
    expect(createRes.data.container.size).toEqual('1.00')

    const updateRes = await ctx.request.put(`/api/v1/container/${createRes.data.container.id}`,
      { type: 'Draught', size: '0.10' },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)
    expect(updateRes.data.container.type).toEqual('Draught')
    expect(updateRes.data.container.size).toEqual('0.10')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${createRes.data.container.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.container.id).toEqual(updateRes.data.container.id)
    expect(getRes.data.container.type).toEqual(updateRes.data.container.type)
    expect(getRes.data.container.size).toEqual(updateRes.data.container.size)
  })

  it('get empty container list', async () => {
    const res = await ctx.request.get(`/api/v1/container`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.containers.length).toEqual(0)
  })

})
