import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  BreweryBody,
  BreweryListBody,
  BrewerySearchBody,
  ReadBreweryBody,
} from '../../src/web/brewery/brewery.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const breweryId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'

const brewery = {
  id: breweryId,
  name: 'Plzeňský Prazdroj',
  country: 'CZ',
}

const breweryBody: BreweryBody = { brewery }

const requestBody = { name: 'Plzeňský Prazdroj', country: 'CZ' }

suite('brewery routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a brewery', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<BreweryBody>>(
      async () => breweryBody,
    )
    await server.start({ brewery: { create } })

    const res = await server.request.post(
      '/api/v1/brewery',
      requestBody,
      headers,
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, breweryBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a brewery', async () => {
    const update = mockFunction<[request: IdBodyRequest], Promise<BreweryBody>>(
      async () => breweryBody,
    )
    await server.start({ brewery: { update } })

    const res = await server.request.put(
      `/api/v1/brewery/${breweryId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, breweryBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: breweryId, body: requestBody }]],
    )
  })

  test('find a brewery', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadBreweryBody>>(
      async () => ({ brewery }),
    )
    await server.start({ brewery: { find } })

    const res = await server.request.get(
      `/api/v1/brewery/${breweryId}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { brewery })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: breweryId }]],
    )
  })

  test('list breweries', async () => {
    const listBody: BreweryListBody = {
      breweries: [brewery],
      pagination: { size: 20, skip: 40 },
    }
    const list = mockFunction<
      [request: PaginationRequest],
      Promise<BreweryListBody>
    >(async () => listBody)
    await server.start({ brewery: { list } })

    const res = await server.request.get(
      '/api/v1/brewery?size=20&skip=40',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization, pagination: { size: '20', skip: '40' } }]],
    )
  })

  test('search breweries', async () => {
    const searchBody: BrewerySearchBody = { breweries: [brewery] }
    const search = mockFunction<
      [request: BodyRequest],
      Promise<BrewerySearchBody>
    >(async () => searchBody)
    await server.start({ brewery: { search } })

    const res = await server.request.post(
      '/api/v1/brewery/search',
      { name: 'prazdroj' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, searchBody)
    assertDeepEqual(
      search.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: { name: 'prazdroj' } }]],
    )
  })
})
