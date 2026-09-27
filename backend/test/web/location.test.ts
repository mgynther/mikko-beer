import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  LocationBody,
  LocationListBody,
  LocationSearchBody,
  ReadLocationBody,
} from '../../src/web/location/location.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const locationId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'

const location = {
  id: locationId,
  name: 'Pivovarský dům',
}

const locationBody: LocationBody = { location }

const requestBody = { name: 'Pivovarský dům' }

suite('location routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a location', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<LocationBody>>(
      async () => locationBody,
    )
    await server.start({ location: { create } })

    const res = await server.request.post(
      '/api/v1/location',
      requestBody,
      headers,
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, locationBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a location', async () => {
    const update = mockFunction<
      [request: IdBodyRequest],
      Promise<LocationBody>
    >(async () => locationBody)
    await server.start({ location: { update } })

    const res = await server.request.put(
      `/api/v1/location/${locationId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, locationBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: locationId, body: requestBody }]],
    )
  })

  test('find a location', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadLocationBody>>(
      async () => ({ location }),
    )
    await server.start({ location: { find } })

    const res = await server.request.get(
      `/api/v1/location/${locationId}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { location })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: locationId }]],
    )
  })

  test('list locations', async () => {
    const listBody: LocationListBody = {
      locations: [location],
      pagination: { size: 20, skip: 40 },
    }
    const list = mockFunction<
      [request: PaginationRequest],
      Promise<LocationListBody>
    >(async () => listBody)
    await server.start({ location: { list } })

    const res = await server.request.get(
      '/api/v1/location?size=20&skip=40',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization, pagination: { size: '20', skip: '40' } }]],
    )
  })

  test('search locations', async () => {
    const searchBody: LocationSearchBody = { locations: [location] }
    const search = mockFunction<
      [request: BodyRequest],
      Promise<LocationSearchBody>
    >(async () => searchBody)
    await server.start({ location: { search } })

    const res = await server.request.post(
      '/api/v1/location/search',
      { name: 'pivovarský' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, searchBody)
    assertDeepEqual(
      search.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: { name: 'pivovarský' } }]],
    )
  })
})
