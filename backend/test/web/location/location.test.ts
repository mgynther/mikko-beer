import { expect } from 'earl'

import { TestContext } from '../test-context'
import { Location } from '../../../src/core/location/location'

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

    expect(res.status).toEqual(201)
    expect(res.data.location.name).toEqual('Oluthuone Panimomestari')

    const getRes = await ctx.request.get<{ location: Location }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.location).toEqual(res.data.location)

    const listRes = await ctx.request.get(`/api/v1/location?skip=0&size=100`,
      ctx.adminAuthHeaders()
    )
    expect(listRes.status).toEqual(200)
    expect(listRes.data.locations.length).toEqual(1)

    const searchRes = await ctx.request.post(`/api/v1/location/search`,
      { name: 'luth' },
      ctx.adminAuthHeaders()
    )
    expect(searchRes.status).toEqual(200)
    expect(searchRes.data.locations.length).toEqual(1)

    const badSearchRes = await ctx.request.post(`/api/v1/location/search`,
      { name: 'Panimm' },
      ctx.adminAuthHeaders()
    )
    expect(badSearchRes.status).toEqual(200)
    expect(badSearchRes.data.locations.length).toEqual(0)
  })

  it('update a location', async () => {
    const res = await ctx.request.post(`/api/v1/location`,
      { name: 'Kuja' },
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(201)
    expect(res.data.location.name).toEqual('Kuja')

    const updateRes = await ctx.request.put(`/api/v1/location/${res.data.location.id}`,
      { name: 'Kuja Beer Shop & Bar' },
      ctx.adminAuthHeaders()
    )
    expect(updateRes.status).toEqual(200)
    expect(updateRes.data.location.name).toEqual('Kuja Beer Shop & Bar')

    const getRes = await ctx.request.get<{ location: Location }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders()
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.location).toEqual(updateRes.data.location)
  })

  it('fail to create a location without name', async () => {
    const res = await ctx.request.post(`/api/v1/location`,
      {},
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(400)
  })

  it('get empty location list', async () => {
    const res = await ctx.request.get(`/api/v1/location`,
      ctx.adminAuthHeaders()
    )

    expect(res.status).toEqual(200)
    expect(res.data.locations.length).toEqual(0)
  })

})
