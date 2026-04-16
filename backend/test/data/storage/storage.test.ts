import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type {
  StorageRequest,
  StorageWithDate,
} from '../../../src/core/storage/storage.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as storageRepository from '../../../src/data/storage/storage.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { insertMultipleReviews } from '../review-helpers.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../assert.js'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(db: Database): Promise<StorageWithDate> {
    return await db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<StorageWithDate> => {
        const [brewery, style, beer, container] = await Promise.all([
          breweryRepository.insertBrewery(trx, {
            name: 'Koskipanimo',
          }),
          styleRepository.insertStyle(trx, {
            name: 'Pils',
          }),
          beerRepository.insertBeer(trx, {
            name: 'Pils',
          }),
          containerRepository.insertContainer(trx, {
            type: 'Can',
            size: '0.25',
          }),
        ])
        const [storage] = await Promise.all([
          storageRepository.insertStorage(trx, {
            beer: beer.id,
            bestBefore: '2024-12-02T12:12:12.000Z',
            container: container.id,
          }),
          beerRepository.insertBeerBreweries(trx, [
            { beer: beer.id, brewery: brewery.id },
          ]),
          beerRepository.insertBeerStyles(trx, [
            { beer: beer.id, style: style.id },
          ]),
        ])
        return storage
      },
    )
  }

  it('lock storage that exists', async () => {
    const storage = await createStorage(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, storage.id)
      assertEqual(lockedKey, storage.id)
    })
  })

  it('storage does not have review', async () => {
    const storage = await createStorage(ctx.db)
    const found = await storageRepository.findStorageById(ctx.db, storage.id)
    assertEqual(found?.hasReview, false)
  })

  it('storages have reviews', async () => {
    const noReviewStorage = await createStorage(ctx.db)
    const { data } = await insertMultipleReviews(5, ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.insertStorage(trx, {
        beer: data.otherBeer.id,
        bestBefore: '2023-12-02T12:12:12.000Z',
        container: data.container.id,
      })
      await storageRepository.insertStorage(trx, {
        beer: data.beer.id,
        bestBefore: '2022-12-02T12:12:12.000Z',
        container: data.container.id,
      })
    })
    const results = await storageRepository.listStorages(ctx.db, {
      skip: 0,
      size: 20,
    })
    assertEqual(results.length, 3)
    const [beerResult, otherBeerResult, noReviewResult] = results
    assertEqual(beerResult.beerId, data.beer.id)
    assertEqual(beerResult.hasReview, true)
    assertEqual(otherBeerResult.beerId, data.otherBeer.id)
    assertEqual(otherBeerResult.hasReview, true)
    assertEqual(noReviewResult.beerId, noReviewStorage.beer)
    assertEqual(noReviewResult.hasReview, false)
  })

  it('delete storage', async () => {
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

  it('do not lock storage that does not exists', async () => {
    const dummyId = 'a3386d9d-cf3f-4ae9-9101-493a117a5458'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(trx, dummyId)
      assertEqual(lockedKey, undefined)
    })
  })

  async function createStatsData(db: Database): Promise<void> {
    const { data } = await insertMultipleReviews(5, db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const storageRequest: StorageRequest = {
        beer: data.otherBeer.id,
        bestBefore: '2023-12-02T12:12:12.000Z',
        container: data.container.id,
      }
      async function storageFromBestBefore(bestBefore: string): Promise<void> {
        await storageRepository.insertStorage(trx, {
          ...storageRequest,
          bestBefore,
        })
      }
      await storageFromBestBefore('2023-12-02T12:12:12.000Z')
      await storageFromBestBefore('2022-12-02T12:12:12.000Z')
      await storageFromBestBefore('2022-12-02T12:12:12.000Z')
      await storageFromBestBefore('2023-11-02T12:12:12.000Z')
      await storageFromBestBefore('2023-11-02T12:12:12.000Z')
    })
  }

  it('annual storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getAnnualStorageStats(ctx.db)
    assertEqual(results.length, 2)
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

  it('monthly storage stats', async () => {
    await createStatsData(ctx.db)
    const results = await storageRepository.getMonthlyStorageStats(ctx.db)
    assertEqual(results.length, 3)
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
