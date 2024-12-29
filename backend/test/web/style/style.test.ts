import { expect } from 'earl'

import { TestContext } from '../test-context'
import { StyleWithParentsAndChildren } from '../../../src/core/style/style'

describe('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('create a style', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Wild', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(201)
    expect(res.data.style.name).toEqual('Wild')
    expect(res.data.style.parents).toEqual([])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.style.id).toEqual(res.data.style.id)
    expect(getRes.data.style.name).toEqual(res.data.style.name)
    expect(getRes.data.style.children).toEqual([])
    expect(getRes.data.style.parents).toEqual([])
  })

  it('create a child style', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(201)
    expect(res.data.style.name).toEqual('Pale Ale')
    expect(res.data.style.id).not.toEqual(null)
    expect(res.data.style.parents).toEqual([])

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).toEqual(201)
    expect(childRes.data.style.name).toEqual('India Pale Ale')
    expect(childRes.data.style.parents).not.toEqual(null)
    expect(childRes.data.style.parents).toEqual([ res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.style.id).toEqual(childRes.data.style.id)
    expect(getRes.data.style.name).toEqual(childRes.data.style.name)
    expect(getRes.data.style.children).toEqual([])
    expect(getRes.data.style.parents).toEqual([{
      id: res.data.style.id,
      name: res.data.style.name,
    }])

    const getParentRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getParentRes.status).toEqual(200)
    expect(getParentRes.data.style.children).toEqual([{
      id: childRes.data.style.id,
      name: childRes.data.style.name,
    }])
    expect(getParentRes.data.style.parents).toEqual([])
  })

  it('create a child style with 2 parents', async () => {
    const parent1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(parent1Res.status).toEqual(201)

    const parent2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(parent2Res.status).toEqual(201)

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Cream Ale', parents: [ parent1Res.data.style.id, parent2Res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).toEqual(201)
    expect(childRes.data.style.name).toEqual('Cream Ale')
    expect(childRes.data.style.parents).not.toEqual(null)
    expect(childRes.data.style.parents).toEqual([ parent1Res.data.style.id, parent2Res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.style.id).toEqual(childRes.data.style.id)
    expect(getRes.data.style.name).toEqual('Cream Ale')
    expect(getRes.data.style.children).toEqual([])
    expect(getRes.data.style.parents).toEqual([
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

    expect(listRes.status).toEqual(200)
    expect(listRes.data.styles.length).toEqual(3)
  })

  it('fail to create a child style with invalid parent', async () => {
    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: ['d31020d9-c400-41f4-91bb-2c847dcf1fbe' ]},
      ctx.adminAuthHeaders()
    )

    expect(childRes.status).toEqual(400)
  })

  it('fail to create a style without name', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(400)
  })

  it('update a style', async () => {
    const aleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )

    const lagerRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager', parents: [] },
      ctx.adminAuthHeaders()
    )

    expect(aleRes.status).toEqual(201)
    expect(lagerRes.status).toEqual(201)

    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    expect(createRes.status).toEqual(201)
    expect(createRes.data.style.name).toEqual('India Pale Ale')
    expect(createRes.data.style.parents).toEqual([ aleRes.data.style.id ])

    const updateRes = await ctx.request.put(`/api/v1/style/${createRes.data.style.id}`,
      { name: 'India Pale Lager', parents: [ lagerRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${createRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.style.id).toEqual(updateRes.data.style.id)
    expect(getRes.data.style.name).toEqual(updateRes.data.style.name)
    expect(getRes.data.style.parents).toEqual([{
      id: lagerRes.data.style.id,
      name: lagerRes.data.style.name,
    }])
  })

  it('fail to update a child style with invalid parent', async () => {
    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: []},
      ctx.adminAuthHeaders()
    )
    expect(createRes.status).toEqual(201)

    const style = createRes.data.style
    const updateRes = await ctx.request.put(`/api/v1/style/${style.id}`,
      { name: style.name, parents: ['c407a67d-1e4c-48b3-8e46-29e05d834a8f']},
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(400)

  })

  it('get empty style list', async () => {
    const res = await ctx.request.get(`/api/v1/style`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.styles.length).toEqual(0)
  })

  it('fail to create cyclic relationship', async () => {
    const aleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(aleRes.status).toEqual(201)

    const ipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(ipaRes.status).toEqual(201)

    const neipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Neipa', parents: [ ipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(neipaRes.status).toEqual(201)

    const updateRes = await ctx.request.put(`/api/v1/style/${aleRes.data.style.id}`,
      { name: 'Pale Ale', parents: [ neipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(400)
  })

})
