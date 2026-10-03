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
  AnnualStorageStatsBody,
  CreatedOrUpdatedStorage,
  MonthlyStorageStatsBody,
  ReadStorage,
  ReadStorageBody,
  StorageBody,
  StorageListBody,
  StoragesBody,
} from '../../../src/web/storage/storage.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedContainer } from '../../../src/web/container/container.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'

interface Names {
  beer: string
  brewery: string
  style: string
}

// A beer with what a storage of it lists along with it.
interface StorableBeer {
  beer: CreatedOrUpdatedBeer
  brewery: CreatedOrUpdatedBrewery
  style: CreatedOrUpdatedStyle
}

interface StorageRequest {
  bestBefore: string
  beer: string
  container: string
}

const lindemansKriek: Names = {
  beer: 'Lindemans Kriek',
  brewery: 'Lindemans',
  style: 'Kriek',
}

const nokianIpa: Names = {
  beer: 'Nokian IPA',
  brewery: 'Nokian Panimo',
  style: 'IPA',
}

function storageRequest(
  { beer }: StorableBeer,
  container: CreatedOrUpdatedContainer,
): StorageRequest {
  return {
    bestBefore: '2024-10-01T00:00:00.000Z',
    beer: beer.id,
    container: container.id,
  }
}

// When the storage was created is the database's to decide, so it is taken
// from what was read.
function read(
  { beer, brewery, style }: StorableBeer,
  container: CreatedOrUpdatedContainer,
  storage: CreatedOrUpdatedStorage,
  createdAt: string,
): ReadStorage {
  return {
    id: storage.id,
    beerId: beer.id,
    beerName: beer.name,
    bestBefore: storage.bestBefore,
    breweries: [{ id: brewery.id, name: brewery.name }],
    container,
    createdAt,
    hasReview: false,
    styles: [{ id: style.id, name: style.name }],
  }
}

suite('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createContainer(): Promise<CreatedOrUpdatedContainer> {
    const res = await ctx.request.post<{
      container: CreatedOrUpdatedContainer
    }>(
      `/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.container
  }

  async function createBeer(names: Names): Promise<StorableBeer> {
    const [styleRes, breweryRes] = await Promise.all([
      ctx.request.post<{ style: CreatedOrUpdatedStyle }>(
        `/api/v1/style`,
        { name: names.style, parents: [] },
        ctx.adminAuthHeaders(),
      ),
      ctx.request.post<{ brewery: CreatedOrUpdatedBrewery }>(
        `/api/v1/brewery`,
        { name: names.brewery },
        ctx.adminAuthHeaders(),
      ),
    ])
    assertEqual(styleRes.status, 201)
    assertEqual(breweryRes.status, 201)

    const beerRes = await ctx.request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: names.beer,
        breweries: [breweryRes.data.brewery.id],
        styles: [styleRes.data.style.id],
      },
      ctx.adminAuthHeaders(),
    )
    assertEqual(beerRes.status, 201)

    return {
      beer: beerRes.data.beer,
      brewery: breweryRes.data.brewery,
      style: styleRes.data.style,
    }
  }

  async function createStorage(
    request: StorageRequest,
  ): Promise<CreatedOrUpdatedStorage> {
    const res = await ctx.request.post<StorageBody>(
      `/api/v1/storage`,
      request,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 201)
    return res.data.storage
  }

  test('create a storage', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const request = storageRequest(beer, container)

    const res = await ctx.request.post<StorageBody>(
      `/api/v1/storage`,
      request,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, {
      storage: { ...request, id: res.data.storage.id },
    })
  })

  test('update a storage', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const request = storageRequest(beer, container)
    const storage = await createStorage(request)
    const update: StorageRequest = {
      ...request,
      bestBefore: '2024-10-02T00:00:00.000Z',
    }

    const res = await ctx.request.put<StorageBody>(
      `/api/v1/storage/${storage.id}`,
      update,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { storage: { ...update, id: storage.id } })
  })

  test('delete a storage', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const storage = await createStorage(storageRequest(beer, container))

    const deleteRes = await ctx.request.delete(
      `/api/v1/storage/${storage.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(deleteRes.status, 204)

    const getRes = await ctx.request.get<ReadStorageBody>(
      `/api/v1/storage/${storage.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(getRes.status, 404)
  })

  test('find a storage', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const storage = await createStorage(storageRequest(beer, container))

    const res = await ctx.request.get<ReadStorageBody>(
      `/api/v1/storage/${storage.id}`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      storage: read(beer, container, storage, res.data.storage.createdAt),
    })
  })

  test('list storages', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    const storage = await createStorage(storageRequest(beer, container))

    const res = await ctx.request.get<StorageListBody>(
      '/api/v1/storage?size=10&skip=0',
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      storages: [
        read(beer, container, storage, res.data.storages[0]?.createdAt),
      ],
      pagination: { size: 10, skip: 0 },
    })
  })

  const listsById: Array<{
    name: string
    path: (beer: StorableBeer) => string
  }> = [
    { name: 'beer', path: ({ beer }) => `beer/${beer.id}` },
    { name: 'brewery', path: ({ brewery }) => `brewery/${brewery.id}` },
    { name: 'style', path: ({ style }) => `style/${style.id}` },
  ]

  listsById.forEach(({ name, path }) =>
    test(`list storages by ${name}`, async () => {
      const [kriek, ipa, container] = await Promise.all([
        createBeer(lindemansKriek),
        createBeer(nokianIpa),
        createContainer(),
      ])
      const [kriekStorage] = await Promise.all([
        createStorage(storageRequest(kriek, container)),
        createStorage(storageRequest(ipa, container)),
      ])

      const res = await ctx.request.get<StoragesBody>(
        `/api/v1/${path(kriek)}/storage`,
        ctx.adminAuthHeaders(),
      )

      assertEqual(res.status, 200)
      assertDeepEqual(res.data, {
        storages: [
          read(kriek, container, kriekStorage, res.data.storages[0]?.createdAt),
        ],
      })
    }),
  )

  test('get annual storage stats', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    await createStorage(storageRequest(beer, container))

    const res = await ctx.request.get<AnnualStorageStatsBody>(
      `/api/v1/storage/annual-stats`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { annual: [{ year: '2024', count: '1' }] })
  })

  test('get monthly storage stats', async () => {
    const [beer, container] = await Promise.all([
      createBeer(lindemansKriek),
      createContainer(),
    ])
    await createStorage(storageRequest(beer, container))

    const res = await ctx.request.get<MonthlyStorageStatsBody>(
      `/api/v1/storage/monthly-stats`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, {
      monthly: [{ year: '2024', month: '10', count: '1' }],
    })
  })
})
