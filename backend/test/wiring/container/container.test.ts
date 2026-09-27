import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { assertEqual } from '../../assert.js'
import type {
  CreatedOrUpdatedContainer,
  ReadContainer,
} from '../../../src/web/container/container.js'

suite('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('create a container', async () => {
    const res = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.container.type, 'Bottle')
    assertEqual(res.data.container.size, '0.33')

    const getRes = await ctx.request.get<{ container: ReadContainer }>(
      `/api/v1/container/${res.data.container.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.container.id, res.data.container.id)
    assertEqual(getRes.data.container.type, res.data.container.type)
    assertEqual(getRes.data.container.size, res.data.container.size)
  })

  test('fail to create a container as viewer', async () => {
    const { authToken } = await ctx.createUser({ role: 'viewer' })
    const res = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container`,
      { type: 'Bottle', size: '0.33' },
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(res.status, 403)
  })

  test('fail to create a container without type', async () => {
    const res = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(`/api/v1/container`, { size: '0.20' }, ctx.adminAuthHeaders())

    assertEqual(res.status, 400)
  })

  test('update a container', async () => {
    const createRes = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container`,
      { type: 'Draught', size: '1.00' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(createRes.status, 201)
    assertEqual(createRes.data.container.type, 'Draught')
    assertEqual(createRes.data.container.size, '1.00')

    const updateRes = await ctx.request.put<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container/${createRes.data.container.id}`,
      { type: 'Draught', size: '0.10' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(updateRes.status, 200)
    assertEqual(updateRes.data.container.type, 'Draught')
    assertEqual(updateRes.data.container.size, '0.10')

    const getRes = await ctx.request.get<{ container: ReadContainer }>(
      `/api/v1/container/${createRes.data.container.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.container.id, updateRes.data.container.id)
    assertEqual(getRes.data.container.type, updateRes.data.container.type)
    assertEqual(getRes.data.container.size, updateRes.data.container.size)
  })

  test('get empty container list', async () => {
    const res = await ctx.request.get<{ containers: ReadContainer[] }>(
      `/api/v1/container`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertEqual(res.data.containers.length, 0)
  })
})
