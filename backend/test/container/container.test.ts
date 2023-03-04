import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Container } from '../../src/container/container'
import { AxiosResponse } from 'axios'

describe('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should create a container', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(201)
    expect(res.data.container.type).to.equal('Bottle')
    expect(res.data.container.size).to.equal('0.33')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${res.data.container.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.container.id).to.equal(res.data.container.id)
    expect(getRes.data.container.type).to.equal(res.data.container.type)
    expect(getRes.data.container.size).to.equal(res.data.container.size)
  })

  it('should fail to create a container without type', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/container`,
      { size: '0.20' },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(400)
  })

  it('should fail to create a container without size', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Draught' },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(400)
  })

  it('should fail to create a container with invalid size', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/container`,
      { type: 'Draught', size: 'testing' },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(400)
  })

  it('should update a container', async () => {
    const { user, authToken } = await ctx.createUser()

    const createRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Draught', size: '1.00' },
      ctx.createAuthHeaders(authToken)
    )
    expect(createRes.status).to.equal(201)
    expect(createRes.data.container.type).to.equal('Draught')
    expect(createRes.data.container.size).to.equal('1.00')

    const updateRes = await ctx.request.put(`/api/v1/container/${createRes.data.container.id}`,
      { type: 'Draught', size: '0.10' },
      ctx.createAuthHeaders(authToken)
    )
    expect(updateRes.status).to.equal(200)
    expect(updateRes.data.container.type).to.equal('Draught')
    expect(updateRes.data.container.size).to.equal('0.10')

    const getRes = await ctx.request.get<{ container: Container }>(
      `/api/v1/container/${createRes.data.container.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.container.id).to.equal(updateRes.data.container.id)
    expect(getRes.data.container.type).to.equal(updateRes.data.container.type)
    expect(getRes.data.container.size).to.equal(updateRes.data.container.size)
  })

  it('should get empty container list', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get(`/api/v1/container`,
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)
    expect(res.data.containers.length).to.equal(0)
  })

})
