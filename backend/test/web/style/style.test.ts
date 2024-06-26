import { expect } from 'chai'

import { TestContext } from '../test-context'
import { StyleWithParentsAndChildren } from '../../../src/core/style/style'
import { AxiosResponse } from 'axios'

describe('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should create a style', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(201)
    expect(res.data.style.name).to.equal('Wild')
    expect(res.data.style.parents).to.eql([])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(res.data.style.id)
    expect(getRes.data.style.name).to.equal(res.data.style.name)
    expect(getRes.data.style.children).to.eql([])
    expect(getRes.data.style.parents).to.eql([])
  })

  it('should create a child style', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(201)
    expect(res.data.style.name).to.equal('Pale Ale')
    expect(res.data.style.id).not.to.equal(null)
    expect(res.data.style.parents).to.eql([])

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).to.equal(201)
    expect(childRes.data.style.name).to.equal('India Pale Ale')
    expect(childRes.data.style.parents).not.to.equal(null)
    expect(childRes.data.style.parents).to.eql([ res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(childRes.data.style.id)
    expect(getRes.data.style.name).to.equal(childRes.data.style.name)
    expect(getRes.data.style.children).to.eql([])
    expect(getRes.data.style.parents).to.eql([{
      id: res.data.style.id,
      name: res.data.style.name,
    }])

    const getParentRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getParentRes.status).to.equal(200)
    expect(getParentRes.data.style.children).to.eql([{
      id: childRes.data.style.id,
      name: childRes.data.style.name,
    }])
    expect(getParentRes.data.style.parents).to.eql([])
  })

  it('should create a child style with 2 parents', async () => {
    const parent1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(parent1Res.status).to.equal(201)

    const parent2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(parent2Res.status).to.equal(201)

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Cream Ale', parents: [ parent1Res.data.style.id, parent2Res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).to.equal(201)
    expect(childRes.data.style.name).to.equal('Cream Ale')
    expect(childRes.data.style.parents).not.to.equal(null)
    expect(childRes.data.style.parents).to.eql([ parent1Res.data.style.id, parent2Res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(childRes.data.style.id)
    expect(getRes.data.style.name).to.equal('Cream Ale')
    expect(getRes.data.style.children).to.eql([])
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
      ctx.adminAuthHeaders()
    )

    expect(listRes.status).to.equal(200)
    expect(listRes.data.styles.length).to.equal(3)
  })

  it('should fail to create a child style with invalid parent', async () => {
    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: ['d31020d9-c400-41f4-91bb-2c847dcf1fbe' ]},
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).to.equal(400)
  })

  it('should fail to create a style without name', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(400)
  })

  it('should update a style', async () => {
    const aleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )

    const lagerRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(aleRes.status).to.equal(201)
    expect(lagerRes.status).to.equal(201)

    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(createRes.status).to.equal(201)
    expect(createRes.data.style.name).to.equal('India Pale Ale')
    expect(createRes.data.style.parents).to.eql([ aleRes.data.style.id ])

    const updateRes = await ctx.request.put(`/api/v1/style/${createRes.data.style.id}`,
      { name: 'India Pale Lager', parents: [ lagerRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${createRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.style.id).to.equal(updateRes.data.style.id)
    expect(getRes.data.style.name).to.equal(updateRes.data.style.name)
    expect(getRes.data.style.parents).to.eql([{
      id: lagerRes.data.style.id,
      name: lagerRes.data.style.name,
    }])
  })

  it('should fail to update a child style with invalid parent', async () => {
    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: []},
      ctx.adminAuthHeaders()
    )
    expect(createRes.status).to.equal(201)

    const style = createRes.data.style
    const updateRes = await ctx.request.put(`/api/v1/style/${style.id}`,
      { name: style.name, parents: ['c407a67d-1e4c-48b3-8e46-29e05d834a8f']},
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).to.equal(400)

  })

  it('should get empty style list', async () => {
    const res = await ctx.request.get(`/api/v1/style`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).to.equal(200)
    expect(res.data.styles.length).to.equal(0)
  })

  it('should fail to create cyclic relationship', async () => {
    const aleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(aleRes.status).to.equal(201)

    const ipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(ipaRes.status).to.equal(201)

    const neipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Neipa', parents: [ ipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(neipaRes.status).to.equal(201)

    const updateRes = await ctx.request.put(`/api/v1/style/${aleRes.data.style.id}`,
      { name: 'Pale Ale', parents: [ neipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).to.equal(400)
  })

})
