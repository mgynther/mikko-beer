import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import type { StyleWithParentsAndChildren } from '../../../src/core/style/style'
import { assertDeepEqual, assertEqual } from '../../assert'

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

    assertEqual(res.status, 201)
    assertEqual(res.data.style.name, 'Wild')
    assertDeepEqual(res.data.style.parents, [])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.style.id, res.data.style.id)
    assertEqual(getRes.data.style.name, res.data.style.name)
    assertDeepEqual(getRes.data.style.children, [])
    assertDeepEqual(getRes.data.style.parents, [])
  })

  it('create a child style', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.style.name, 'Pale Ale')
    assert.notEqual(res.data.style.id, null)
    assertDeepEqual(res.data.style.parents, [])

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    assertEqual(childRes.status, 201)
    assertEqual(childRes.data.style.name, 'India Pale Ale')
    assert.notEqual(childRes.data.style.parents, null)
    assertDeepEqual(childRes.data.style.parents, [ res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.style.id, childRes.data.style.id)
    assertEqual(getRes.data.style.name, childRes.data.style.name)
    assertDeepEqual(getRes.data.style.children, [])
    assertDeepEqual(getRes.data.style.parents, [{
      id: res.data.style.id,
      name: res.data.style.name,
    }])

    const getParentRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${res.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getParentRes.status, 200)
    assertDeepEqual(getParentRes.data.style.children, [{
      id: childRes.data.style.id,
      name: childRes.data.style.name,
    }])
    assertDeepEqual(getParentRes.data.style.parents, [])
  })

  it('create a child style with 2 parents', async () => {
    const parent1Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    assertEqual(parent1Res.status, 201)

    const parent2Res = await ctx.request.post(`/api/v1/style`,
      { name: 'Lager', parents: [] },
      ctx.adminAuthHeaders()
    )
    assertEqual(parent2Res.status, 201)

    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Cream Ale', parents: [ parent1Res.data.style.id, parent2Res.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    assertEqual(childRes.status, 201)
    assertEqual(childRes.data.style.name, 'Cream Ale')
    assert.notEqual(childRes.data.style.parents, null)
    assertDeepEqual(childRes.data.style.parents, [ parent1Res.data.style.id, parent2Res.data.style.id ])

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${childRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.style.id, childRes.data.style.id)
    assertEqual(getRes.data.style.name, 'Cream Ale')
    assertDeepEqual(getRes.data.style.children, [])
    assertDeepEqual(getRes.data.style.parents, [
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

    assertEqual(listRes.status, 200)
    assertEqual(listRes.data.styles.length, 3)
  })

  it('fail to create a child style with invalid parent', async () => {
    const childRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: ['d31020d9-c400-41f4-91bb-2c847dcf1fbe' ]},
      ctx.adminAuthHeaders()
    )

    assertEqual(childRes.status, 400)
  })

  it('fail to create a style without name', async () => {
    const res = await ctx.request.post(`/api/v1/style`,
      { parents: [] },
      ctx.adminAuthHeaders()
    )

    assertEqual(res.status, 400)
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

    assertEqual(aleRes.status, 201)
    assertEqual(lagerRes.status, 201)

    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'India Pale Ale', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    assertEqual(createRes.status, 201)
    assertEqual(createRes.data.style.name, 'India Pale Ale')
    assertDeepEqual(createRes.data.style.parents, [ aleRes.data.style.id ])

    const updateRes = await ctx.request.put(`/api/v1/style/${createRes.data.style.id}`,
      { name: 'India Pale Lager', parents: [ lagerRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )

    const getRes = await ctx.request.get<{ style: StyleWithParentsAndChildren }>(
      `/api/v1/style/${createRes.data.style.id}`,
      ctx.adminAuthHeaders()
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.style.id, updateRes.data.style.id)
    assertEqual(getRes.data.style.name, updateRes.data.style.name)
    assertDeepEqual(getRes.data.style.parents, [{
      id: lagerRes.data.style.id,
      name: lagerRes.data.style.name,
    }])
  })

  it('fail to update a child style with invalid parent', async () => {
    const createRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Gueuze', parents: []},
      ctx.adminAuthHeaders()
    )
    assertEqual(createRes.status, 201)

    const style = createRes.data.style
    const updateRes = await ctx.request.put(`/api/v1/style/${style.id}`,
      { name: style.name, parents: ['c407a67d-1e4c-48b3-8e46-29e05d834a8f']},
      ctx.adminAuthHeaders()
    )
    assertEqual(updateRes.status, 400)

  })

  it('get empty style list', async () => {
    const res = await ctx.request.get(`/api/v1/style`,
      ctx.adminAuthHeaders()
    )

    assertEqual(res.status, 200)
    assertEqual(res.data.styles.length, 0)
  })

  it('fail to create cyclic relationship', async () => {
    const aleRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Pale Ale', parents: [] },
      ctx.adminAuthHeaders()
    )
    assertEqual(aleRes.status, 201)

    const ipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'IPA', parents: [ aleRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    assertEqual(ipaRes.status, 201)

    const neipaRes = await ctx.request.post(`/api/v1/style`,
      { name: 'Neipa', parents: [ ipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    assertEqual(neipaRes.status, 201)

    const updateRes = await ctx.request.put(`/api/v1/style/${aleRes.data.style.id}`,
      { name: 'Pale Ale', parents: [ neipaRes.data.style.id ] },
      ctx.adminAuthHeaders()
    )
    assertEqual(updateRes.status, 400)
  })

})
