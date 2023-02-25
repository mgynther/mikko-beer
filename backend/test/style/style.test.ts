import { expect } from 'chai'

import { TestContext } from '../test-context'
import { Style, StyleWithParents } from '../../src/style/style'
import { AxiosResponse } from 'axios'

describe('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should create a style', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild' },
      createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(201)
    expect(res.data.style.name).to.equal('Wild')
    expect(res.data.style.parents).to.eql([])

    const getRes = await ctx.request.get<{ style: StyleWithParents }>(
      `/api/v1/style/${res.data.style.id}`,
      createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(res.data.style.id)
    expect(getRes.data.style.name).to.equal(res.data.style.name)
    expect(getRes.data.style.parents).to.eql([])
  })

  it('should create a child style', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale' },
      createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(201)
    expect(res.data.style.name).to.equal('Pale Ale')
    expect(res.data.style.id).not.to.equal(null)
    expect(res.data.style.parents).to.eql([])

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ res.data.style.id ] },
      createAuthHeaders(authToken)
    )

    expect(childRes.status).to.equal(201)
    expect(childRes.data.style.name).to.equal('India Pale Ale')
    expect(childRes.data.style.parents).not.to.equal(null)
    expect(childRes.data.style.parents).to.eql([ res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParents }>(
      `/api/v1/style/${childRes.data.style.id}`,
      createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(childRes.data.style.id)
    expect(getRes.data.style.name).to.equal(childRes.data.style.name)
    expect(getRes.data.style.parents).to.eql([{
      id: res.data.style.id,
      name: res.data.style.name,
    }])
  })

  it('should create a child style with 2 parents', async () => {
    const { user, authToken } = await ctx.createUser()

    const parent1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Ale' },
      createAuthHeaders(authToken)
    )
    expect(parent1Res.status).to.equal(201)

    const parent2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager' },
      createAuthHeaders(authToken)
    )
    expect(parent2Res.status).to.equal(201)

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Cream Ale', parents: [ parent1Res.data.style.id, parent2Res.data.style.id ] },
      createAuthHeaders(authToken)
    )

    expect(childRes.status).to.equal(201)
    expect(childRes.data.style.name).to.equal('Cream Ale')
    expect(childRes.data.style.parents).not.to.equal(null)
    expect(childRes.data.style.parents).to.eql([ parent1Res.data.style.id, parent2Res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParents }>(
      `/api/v1/style/${childRes.data.style.id}`,
      createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(childRes.data.style.id)
    expect(getRes.data.style.name).to.equal('Cream Ale')
    expect(getRes.data.style.parents).to.eql([
      {
        id: parent1Res.data.style.id,
        name: parent1Res.data.style.name,
      },
      {
        id: parent2Res.data.style.id,
        name: parent2Res.data.style.name,
      }
    ])

    const listRes = await ctx.request.get(`/api/v1/style`,
      createAuthHeaders(authToken)
    )

    expect(listRes.status).to.equal(200)
    expect(listRes.data.styles.length).to.equal(3)
  })

  it('should fail to create a child style with invalid parent', async () => {
    const { user, authToken } = await ctx.createUser()

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: ['d31020d9-c400-41f4-91bb-2c847dcf1fbe' ]},
      createAuthHeaders(authToken)
    )

    // TODO It would be cleaner to report a client error.
    expect(childRes.status).to.equal(500)
  })

  it('should fail to create a style without name', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/style`,
      {},
      createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(400)
  })

  it('should get empty style list', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get(`/api/v1/style`,
      createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)
    expect(res.data.styles.length).to.equal(0)
  })

  function createAuthHeaders(authToken: string) {
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  }
})
