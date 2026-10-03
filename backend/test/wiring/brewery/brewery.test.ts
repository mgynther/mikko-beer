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
  BreweryBody,
  BreweryListBody,
  BrewerySearchBody,
  ReadBreweryBody,
} from '../../../src/web/brewery/brewery.js'

suite('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createBrewery(request: {
    name: string
    country?: string
  }): Promise<string> {
    const res = await ctx.request.post<BreweryBody>(
      `/api/v1/brewery`,
      request,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.brewery.id
  }

  test('create a brewery', async () => {
    const request = { name: 'Lindemans', country: 'BE' }

    const res = await ctx.request.post<BreweryBody>(
      `/api/v1/brewery`,
      request,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, {
      brewery: { ...request, id: res.data.brewery.id },
    })
  })

  // A brewery without a country is answered without the property.
  test('find a brewery', async () => {
    const id = await createBrewery({ name: 'Lindemans' })

    const res = await ctx.request.get<ReadBreweryBody>(
      `/api/v1/brewery/${id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertEqual(res.data.brewery.id, id)
    assertEqual(res.data.brewery.name, 'Lindemans')
    assertEqual('country' in res.data.brewery, false)
  })

  test('update a brewery', async () => {
    const id = await createBrewery({ name: 'Lindemans' })
    const update = { name: 'Brouwerij Lindemans', country: 'BE' }

    const res = await ctx.request.put<BreweryBody>(
      `/api/v1/brewery/${id}`,
      update,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { brewery: { ...update, id } })
  })

  test('list breweries', async () => {
    const id = await createBrewery({ name: 'Lindemans', country: 'BE' })

    const res = await ctx.request.get<BreweryListBody>(
      `/api/v1/brewery?size=10&skip=0`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      breweries: [{ id, name: 'Lindemans', country: 'BE' }],
      pagination: { size: 10, skip: 0 },
    })
  })

  test('search breweries', async () => {
    const [id] = await Promise.all([
      createBrewery({ name: 'Lindemans', country: 'BE' }),
      createBrewery({ name: 'Nokian Panimo', country: 'FI' }),
    ])

    const res = await ctx.request.post<BrewerySearchBody>(
      '/api/v1/brewery/search',
      { name: 'Linde' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      breweries: [{ id, name: 'Lindemans', country: 'BE' }],
    })
  })
})
