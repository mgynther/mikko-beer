import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  StyleBody,
  StyleListBody,
  ReadStyleBody,
} from '../../src/web/style/style.js'
import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const styleId = '3b9f2a1c-7d4e-4f5a-8b6c-9d0e1f2a3b4c'

const lagerId = 'e5f6a7b8-9c0d-4e1f-8a2b-3c4d5e6f7a8b'

const createdStyle = { id: styleId, name: 'Pilsner', parents: [lagerId] }

const styleBody: StyleBody = { style: createdStyle }

const readStyle = {
  id: styleId,
  name: 'Pilsner',
  children: [],
  parents: [{ id: lagerId, name: 'Lager' }],
}

const listedStyle = createdStyle

const requestBody = { name: 'Pilsner', parents: [lagerId] }

suite('style routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a style', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<StyleBody>>(
      async () => styleBody,
    )
    await server.start({ style: { create } })

    const res = await server.request.post('/api/v1/style', requestBody, headers)

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, styleBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a style', async () => {
    const update = mockFunction<[request: IdBodyRequest], Promise<StyleBody>>(
      async () => styleBody,
    )
    await server.start({ style: { update } })

    const res = await server.request.put(
      `/api/v1/style/${styleId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, styleBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: styleId, body: requestBody }]],
    )
  })

  test('find a style', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadStyleBody>>(
      async () => ({ style: readStyle }),
    )
    await server.start({ style: { find } })

    const res = await server.request.get(`/api/v1/style/${styleId}`, headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { style: readStyle })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: styleId }]],
    )
  })

  test('list styles', async () => {
    const listBody: StyleListBody = { styles: [listedStyle] }
    const list = mockFunction<
      [request: AuthorizedRequest],
      Promise<StyleListBody>
    >(async () => listBody)
    await server.start({ style: { list } })

    const res = await server.request.get('/api/v1/style', headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization }]],
    )
  })
})
