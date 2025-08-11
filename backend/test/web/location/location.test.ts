import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import { Location } from '../../../src/core/location/location'
import { assertDeepEqual } from '../../assert'

describe('location tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('create a location', async () => {
    const res = await ctx.request.post(`/api/v1/location`,
      { name: 'Oluthuone Panimomestari' },
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(res.status, 201)
    assertDeepEqual(res.data.location.name, 'Oluthuone Panimomestari')

    const getRes = await ctx.request.get<{ location: Location }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.location, res.data.location)

    const listRes = await ctx.request.get(`/api/v1/location?skip=0&size=100`,
      ctx.adminAuthHeaders()
    )
    assertDeepEqual(listRes.status, 200)
    assertDeepEqual(listRes.data.locations.length, 1)

    const searchRes = await ctx.request.post(`/api/v1/location/search`,
      { name: 'luth' },
      ctx.adminAuthHeaders()
    )
    assertDeepEqual(searchRes.status, 200)
    assertDeepEqual(searchRes.data.locations.length, 1)

    const badSearchRes = await ctx.request.post(`/api/v1/location/search`,
      { name: 'Panimm' },
      ctx.adminAuthHeaders()
    )
    assertDeepEqual(badSearchRes.status, 200)
    assertDeepEqual(badSearchRes.data.locations.length, 0)
  })

  it('update a location', async () => {
    const res = await ctx.request.post(`/api/v1/location`,
      { name: 'Kuja' },
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(res.status, 201)
    assertDeepEqual(res.data.location.name, 'Kuja')

    const updateRes = await ctx.request.put(`/api/v1/location/${res.data.location.id}`,
      { name: 'Kuja Beer Shop & Bar' },
      ctx.adminAuthHeaders()
    )
    assertDeepEqual(updateRes.status, 200)
    assertDeepEqual(updateRes.data.location.name, 'Kuja Beer Shop & Bar')

    const getRes = await ctx.request.get<{ location: Location }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.location, updateRes.data.location)
  })

  it('fail to create a location without name', async () => {
    const res = await ctx.request.post(`/api/v1/location`,
      {},
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(res.status, 400)
  })

  it('get empty location list', async () => {
    const res = await ctx.request.get(`/api/v1/location`,
      ctx.adminAuthHeaders()
    )

    assertDeepEqual(res.status, 200)
    assertDeepEqual(res.data.locations.length, 0)
  })

})
