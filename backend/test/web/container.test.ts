import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  ContainerBody,
  ContainerListBody,
  ReadContainerBody,
} from '../../src/web/container/container.js'
import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const containerId = '3b9f2a1c-7d4e-4f5a-8b6c-9d0e1f2a3b4c'

const container = { id: containerId, type: 'bottle', size: '0.33' }

const containerBody: ContainerBody = { container }

const requestBody = { type: 'bottle', size: '0.33' }

suite('container routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a container', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<ContainerBody>>(
      async () => containerBody,
    )
    await server.start({ container: { create } })

    const res = await server.request.post(
      '/api/v1/container',
      requestBody,
      headers,
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, containerBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a container', async () => {
    const update = mockFunction<
      [request: IdBodyRequest],
      Promise<ContainerBody>
    >(async () => containerBody)
    await server.start({ container: { update } })

    const res = await server.request.put(
      `/api/v1/container/${containerId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, containerBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: containerId, body: requestBody }]],
    )
  })

  test('find a container', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadContainerBody>>(
      async () => ({ container }),
    )
    await server.start({ container: { find } })

    const res = await server.request.get(
      `/api/v1/container/${containerId}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { container })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: containerId }]],
    )
  })

  test('list containers', async () => {
    const listBody: ContainerListBody = { containers: [container] }
    const list = mockFunction<
      [request: AuthorizedRequest],
      Promise<ContainerListBody>
    >(async () => listBody)
    await server.start({ container: { list } })

    const res = await server.request.get('/api/v1/container', headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization }]],
    )
  })
})
