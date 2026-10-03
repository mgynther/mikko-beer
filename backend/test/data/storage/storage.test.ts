import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { StorageWithDate } from '../../../src/data/storage/storage.repository.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as storageRepository from '../../../src/data/storage/storage.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

// A storage is listed only with a beer that has a brewery and a style, so
// every beer here gets one of each. Brewery and style names are unique, so
// the caller names them.
async function insertBeer(
  trx: Transaction,
  names: { brewery: string; style: string },
): Promise<Beer> {
  const [brewery, style, beer] = await Promise.all([
    breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: names.brewery }),
    ),
    styleRepository.insertStyle(trx, buildNewStyle({ name: names.style })),
    beerRepository.insertBeer(trx, buildNewBeer()),
  ])
  await Promise.all([
    beerRepository.insertBeerBreweries(trx, [
      { beer: beer.id, brewery: brewery.id },
    ]),
    beerRepository.insertBeerStyles(trx, [{ beer: beer.id, style: style.id }]),
  ])
  return beer
}

async function insertStorage(
  trx: Transaction,
  beer: Beer,
  container: Container,
  bestBefore: string,
): Promise<StorageWithDate> {
  return await storageRepository.insertStorage(trx, {
    beer: beer.id,
    bestBefore,
    container: container.id,
  })
}

suite('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(db: Database): Promise<StorageWithDate> {
    return await db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<StorageWithDate> => {
        const [beer, container] = await Promise.all([
          insertBeer(trx, {
            brewery: 'Koskipanimo',
            style: 'Pils',
          }),
          containerRepository.insertContainer(trx, buildNewContainer()),
        ])
        return await insertStorage(
          trx,
          beer,
          container,
          '2024-12-02T12:12:12.000Z',
        )
      },
    )
  }

  test('lock storage that exists', async () => {
    const storage = await createStorage(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, storage.id)
      assertEqual(lockedKey, storage.id)
    })
  })

  test('storage does not have review', async () => {
    const storage = await createStorage(ctx.db)
    const found = await storageRepository.findStorageById(ctx.db, storage.id)
    assertEqual(found?.hasReview, false)
  })

  test('storages have reviews', async () => {
    // The storages are listed by their best before dates: the kriek's
    // first, then the IPA's, then the lager's. The kriek is reviewed twice,
    // the IPA once and the lager not at all.
    const { kriek, ipa, lager } = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [kriek, ipa, lager, container, location] = await Promise.all([
          insertBeer(trx, {
            brewery: 'Lindemans',
            style: 'Kriek',
          }),
          insertBeer(trx, {
            brewery: 'Nokian Panimo',
            style: 'IPA',
          }),
          insertBeer(trx, {
            brewery: 'Koskipanimo',
            style: 'Lager',
          }),
          containerRepository.insertContainer(trx, buildNewContainer()),
          locationRepository.insertLocation(trx, buildNewLocation()),
        ])
        await Promise.all([
          ...[kriek, kriek, ipa].map((beer) =>
            reviewRepository.insertReview(
              trx,
              buildNewReview({
                beer: beer.id,
                container: container.id,
                location: location.id,
              }),
            ),
          ),
          insertStorage(trx, lager, container, '2024-12-02T12:12:12.000Z'),
          insertStorage(trx, ipa, container, '2023-12-02T12:12:12.000Z'),
          insertStorage(trx, kriek, container, '2022-12-02T12:12:12.000Z'),
        ])
        return { kriek, ipa, lager }
      },
    )

    const results = await storageRepository.listStorages(ctx.db, {
      skip: 0,
      size: 20,
    })

    // Two reviews of the kriek still make one storage.
    assertDeepEqual(
      results.map(({ beerId, hasReview }) => ({ beerId, hasReview })),
      [
        { beerId: kriek.id, hasReview: true },
        { beerId: ipa.id, hasReview: true },
        { beerId: lager.id, hasReview: false },
      ],
    )
  })

  test('delete storage', async () => {
    const storage = await createStorage(ctx.db)
    const createdStorage = await storageRepository.findStorageById(
      ctx.db,
      storage.id,
    )
    assertTruthy(createdStorage)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.deleteStorageById(trx, storage.id)
    })
    const deletedStorage = await storageRepository.findStorageById(
      ctx.db,
      storage.id,
    )
    assertEqual(deletedStorage, undefined)
  })

  test('update storage', async () => {
    const storage = await createStorage(ctx.db)
    const { container, updated } = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const container = await containerRepository.insertContainer(
          trx,
          buildNewContainer({ type: 'can', size: '0.50' }),
        )
        const updated = await storageRepository.updateStorage(trx, {
          id: storage.id,
          bestBefore: '2025-03-01T12:00:00.000Z',
          beer: storage.beer,
          container: container.id,
        })
        return { container, updated }
      },
    )
    assertDeepEqual(updated, {
      id: storage.id,
      bestBefore: new Date('2025-03-01T12:00:00.000Z'),
      beer: storage.beer,
      container: container.id,
    })
  })

  test('update storage that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await storageRepository.updateStorage(trx, {
          id: '6b3e0d9c-4a7f-4c1e-8d2b-5f9a3e7c0d16',
          bestBefore: '2025-03-01T12:00:00.000Z',
          beer: '8c2f5a0d-3e6b-4d9a-b1c7-0e4f8a2d6b35',
          container: '1d6a9e3c-5f2b-4a8d-9c0e-7b3f1a5d8e42',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('do not lock storage that does not exists', async () => {
    const dummyId = 'a3386d9d-cf3f-4ae9-9101-493a117a5458'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, dummyId)
      assertEqual(lockedKey, undefined)
    })
  })

  // Two storages in December 2022, two in November 2023 and one in
  // December 2023, listed out of order.
  async function createStatsData(db: Database): Promise<void> {
    await db.executeReadWriteTransaction(async (trx: Transaction) => {
      const [beer, container] = await Promise.all([
        insertBeer(trx, {
          brewery: 'Koskipanimo',
          style: 'Pils',
        }),
        containerRepository.insertContainer(trx, buildNewContainer()),
      ])
      await Promise.all(
        [
          '2023-12-02T12:12:12.000Z',
          '2022-12-02T12:12:12.000Z',
          '2022-12-02T12:12:12.000Z',
          '2023-11-02T12:12:12.000Z',
          '2023-11-02T12:12:12.000Z',
        ].map((bestBefore) => insertStorage(trx, beer, container, bestBefore)),
      )
    })
  }

  test('annual storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getAnnualStorageStats(ctx.db)
    assertDeepEqual(results, [
      {
        year: '2022',
        count: '2',
      },
      {
        year: '2023',
        count: '3',
      },
    ])
  })

  test('monthly storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getMonthlyStorageStats(ctx.db)
    assertDeepEqual(results, [
      {
        year: '2022',
        month: '12',
        count: '2',
      },
      {
        year: '2023',
        month: '11',
        count: '2',
      },
      {
        year: '2023',
        month: '12',
        count: '1',
      },
    ])
  })
})
