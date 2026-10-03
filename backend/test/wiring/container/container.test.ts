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
  ContainerBody,
  ContainerListBody,
  ReadContainerBody,
} from '../../../src/web/container/container.js'

suite('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  const bottle = { type: 'Bottle', size: '0.33' }

  async function createContainer(): Promise<string> {
    const res = await ctx.request.post<ContainerBody>(
      `/api/v1/container`,
      bottle,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.container.id
  }

  test('create a container', async () => {
    const res = await ctx.request.post<ContainerBody>(
      `/api/v1/container`,
      bottle,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, {
      container: { ...bottle, id: res.data.container.id },
    })
  })

  test('find a container', async () => {
    const id = await createContainer()

    const res = await ctx.request.get<ReadContainerBody>(
      `/api/v1/container/${id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { container: { ...bottle, id } })
  })

  test('update a container', async () => {
    const id = await createContainer()
    const draught = { type: 'Draught', size: '0.40' }

    const res = await ctx.request.put<ContainerBody>(
      `/api/v1/container/${id}`,
      draught,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { container: { ...draught, id } })
  })

  test('list containers', async () => {
    const id = await createContainer()

    const res = await ctx.request.get<ContainerListBody>(
      `/api/v1/container`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { containers: [{ ...bottle, id }] })
  })
})
