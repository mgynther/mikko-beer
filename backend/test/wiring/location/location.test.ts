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
  LocationBody,
  LocationListBody,
  LocationSearchBody,
  ReadLocationBody,
} from '../../../src/web/location/location.js'

suite('location tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createLocation(name: string): Promise<string> {
    const res = await ctx.request.post<LocationBody>(
      `/api/v1/location`,
      { name },
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.location.id
  }

  test('create a location', async () => {
    const res = await ctx.request.post<LocationBody>(
      `/api/v1/location`,
      { name: 'Kuja' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, {
      location: { id: res.data.location.id, name: 'Kuja' },
    })
  })

  test('find a location', async () => {
    const id = await createLocation('Kuja')

    const res = await ctx.request.get<ReadLocationBody>(
      `/api/v1/location/${id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { location: { id, name: 'Kuja' } })
  })

  test('update a location', async () => {
    const id = await createLocation('Kuja')

    const res = await ctx.request.put<LocationBody>(
      `/api/v1/location/${id}`,
      { name: 'Kuja Beer Shop & Bar' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      location: { id, name: 'Kuja Beer Shop & Bar' },
    })
  })

  test('list locations', async () => {
    const id = await createLocation('Kuja')

    const res = await ctx.request.get<LocationListBody>(
      `/api/v1/location?size=10&skip=0`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      locations: [{ id, name: 'Kuja' }],
      pagination: { size: 10, skip: 0 },
    })
  })

  test('search locations', async () => {
    const [id] = await Promise.all([
      createLocation('Oluthuone Panimomestari'),
      createLocation('Kuja'),
    ])

    const res = await ctx.request.post<LocationSearchBody>(
      `/api/v1/location/search`,
      { name: 'luth' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      locations: [{ id, name: 'Oluthuone Panimomestari' }],
    })
  })
})
