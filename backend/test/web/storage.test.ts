import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  AnnualStorageStatsBody,
  MonthlyStorageStatsBody,
  ReadStorage,
  ReadStorageBody,
  StorageBody,
  StorageListBody,
  StoragesBody,
} from '../../src/web/storage/storage.js'
import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const storageId = '7c8d9e0f-1a2b-4c3d-8e4f-5a6b7c8d9e0f'
const beerId = '5f0c1b5e-6a4f-4d4e-9f0e-2b6a1b0f7c11'
const breweryId = 'c0d7e3a2-2f5b-4a0e-8d61-3f7a9b4e2c10'
const styleId = '9a4b8c6d-1e2f-4a3b-8c5d-6e7f8a9b0c1d'
const containerId = '3b9f2a1c-7d4e-4f5a-8b6c-9d0e1f2a3b4c'

const storageBody: StorageBody = {
  storage: {
    id: storageId,
    bestBefore: '2027-06-30T00:00:00.000Z',
    beer: beerId,
    container: containerId,
  },
}

const readStorage: ReadStorage = {
  id: storageId,
  beerId,
  beerName: 'Pilsner Urquell',
  bestBefore: '2027-06-30T00:00:00.000Z',
  breweries: [{ id: breweryId, name: 'Plzeňský Prazdroj' }],
  container: { id: containerId, type: 'bottle', size: '0.50' },
  createdAt: '2026-09-01T12:00:00.000Z',
  hasReview: false,
  styles: [{ id: styleId, name: 'Lager' }],
}

const storagesBody: StoragesBody = { storages: [readStorage] }

const requestBody = {
  beer: beerId,
  bestBefore: '2027-06-30T00:00:00.000Z',
  container: containerId,
}

function listByMock() {
  return mockFunction<[request: IdRequest], Promise<StoragesBody>>(
    async () => storagesBody,
  )
}

suite('storage routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('get annual storage stats', async () => {
    const body: AnnualStorageStatsBody = {
      annual: [{ year: '2026', count: '12' }],
    }
    const getAnnualStats = mockFunction<
      [request: AuthorizedRequest],
      Promise<AnnualStorageStatsBody>
    >(async () => body)
    await server.start({ storage: { getAnnualStats } })

    const res = await server.request.get(
      '/api/v1/storage/annual-stats',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      getAnnualStats.mock.calls.map((call) => call.arguments),
      [[{ authorization }]],
    )
  })

  test('get monthly storage stats', async () => {
    const body: MonthlyStorageStatsBody = {
      monthly: [{ year: '2026', month: '9', count: '3' }],
    }
    const getMonthlyStats = mockFunction<
      [request: AuthorizedRequest],
      Promise<MonthlyStorageStatsBody>
    >(async () => body)
    await server.start({ storage: { getMonthlyStats } })

    const res = await server.request.get(
      '/api/v1/storage/monthly-stats',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, body)
    assertDeepEqual(
      getMonthlyStats.mock.calls.map((call) => call.arguments),
      [[{ authorization }]],
    )
  })

  test('create a storage', async () => {
    const create = mockFunction<[request: BodyRequest], Promise<StorageBody>>(
      async () => storageBody,
    )
    await server.start({ storage: { create } })

    const res = await server.request.post(
      '/api/v1/storage',
      requestBody,
      headers,
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, storageBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body: requestBody }]],
    )
  })

  test('update a storage', async () => {
    const update = mockFunction<[request: IdBodyRequest], Promise<StorageBody>>(
      async () => storageBody,
    )
    await server.start({ storage: { update } })

    const res = await server.request.put(
      `/api/v1/storage/${storageId}`,
      requestBody,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, storageBody)
    assertDeepEqual(
      update.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: storageId, body: requestBody }]],
    )
  })

  test('delete a storage', async () => {
    const deleteStorage = mockFunction<[request: IdRequest], Promise<void>>(
      async () => undefined,
    )
    await server.start({ storage: { delete: deleteStorage } })

    const res = await server.request.delete(
      `/api/v1/storage/${storageId}`,
      headers,
    )

    assertEqual(res.status, 204)
    assertEqual(res.data, '')
    assertDeepEqual(
      deleteStorage.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: storageId }]],
    )
  })

  test('find a storage', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadStorageBody>>(
      async () => ({ storage: readStorage }),
    )
    await server.start({ storage: { find } })

    const res = await server.request.get(
      `/api/v1/storage/${storageId}`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { storage: readStorage })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: storageId }]],
    )
  })

  test('list storages by beer', async () => {
    const listByBeer = listByMock()
    await server.start({ storage: { listByBeer } })

    const res = await server.request.get(
      `/api/v1/beer/${beerId}/storage`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, storagesBody)
    assertDeepEqual(
      listByBeer.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: beerId }]],
    )
  })

  test('list storages by brewery', async () => {
    const listByBrewery = listByMock()
    await server.start({ storage: { listByBrewery } })

    const res = await server.request.get(
      `/api/v1/brewery/${breweryId}/storage`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, storagesBody)
    assertDeepEqual(
      listByBrewery.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: breweryId }]],
    )
  })

  test('list storages by style', async () => {
    const listByStyle = listByMock()
    await server.start({ storage: { listByStyle } })

    const res = await server.request.get(
      `/api/v1/style/${styleId}/storage`,
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, storagesBody)
    assertDeepEqual(
      listByStyle.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: styleId }]],
    )
  })

  test('list storages', async () => {
    const listBody: StorageListBody = {
      storages: [readStorage],
      pagination: { size: 20, skip: 40 },
    }
    const list = mockFunction<
      [request: PaginationRequest],
      Promise<StorageListBody>
    >(async () => listBody)
    await server.start({ storage: { list } })

    const res = await server.request.get(
      '/api/v1/storage?size=20&skip=40',
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, listBody)
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization, pagination: { size: '20', skip: '40' } }]],
    )
  })
})
