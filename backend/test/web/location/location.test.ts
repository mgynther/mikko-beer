import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import type {
  CreatedOrUpdatedLocation,
  ReadLocation,
} from '../../../src/web/location/location.controller.js'

suite('location tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('create a location', async () => {
    const res = await ctx.request.post<{ location: CreatedOrUpdatedLocation }>(
      `/api/v1/location`,
      { name: 'Oluthuone Panimomestari' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.location.name, 'Oluthuone Panimomestari')

    const getRes = await ctx.request.get<{ location: ReadLocation }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.location, res.data.location)

    const listRes = await ctx.request.get<{ locations: ReadLocation[] }>(
      `/api/v1/location?skip=0&size=100`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(listRes.status, 200)
    assertEqual(listRes.data.locations.length, 1)

    const searchRes = await ctx.request.post<{ locations: ReadLocation[] }>(
      `/api/v1/location/search`,
      { name: 'luth' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(searchRes.status, 200)
    assertEqual(searchRes.data.locations.length, 1)

    const badSearchRes = await ctx.request.post<{ locations: ReadLocation[] }>(
      `/api/v1/location/search`,
      { name: 'Panimm' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(badSearchRes.status, 200)
    assertEqual(badSearchRes.data.locations.length, 0)
  })

  test('update a location', async () => {
    const res = await ctx.request.post<{ location: CreatedOrUpdatedLocation }>(
      `/api/v1/location`,
      { name: 'Kuja' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.location.name, 'Kuja')

    const updateRes = await ctx.request.put<{
      location: CreatedOrUpdatedLocation
    }>(
      `/api/v1/location/${res.data.location.id}`,
      { name: 'Kuja Beer Shop & Bar' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(updateRes.status, 200)
    assertEqual(updateRes.data.location.name, 'Kuja Beer Shop & Bar')

    const getRes = await ctx.request.get<{ location: ReadLocation }>(
      `/api/v1/location/${res.data.location.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.location, updateRes.data.location)
  })

  test('fail to create a location without name', async () => {
    const res = await ctx.request.post<{ location: CreatedOrUpdatedLocation }>(
      `/api/v1/location`,
      {},
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 400)
  })

  test('get empty location list', async () => {
    const res = await ctx.request.get<{ locations: ReadLocation[] }>(
      `/api/v1/location`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertEqual(res.data.locations.length, 0)
  })
})
