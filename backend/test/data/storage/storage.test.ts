import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import type { StorageWithDate } from '../../../src/core/storage/storage'
import type { Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as storageRepository from '../../../src/data/storage/storage.repository'
import * as styleRepository from '../../../src/data/style/style.repository'
import { insertMultipleReviews } from '../review-helpers'
import { assertEqual } from '../../assert'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(): Promise<StorageWithDate> {
    return await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<StorageWithDate> => {
      const brewery = await breweryRepository.insertBrewery(
        trx,
        {
          name: 'Koskipanimo'
        }
      )
      const style = await styleRepository.insertStyle(
        trx,
        {
          name: 'Pils'
        }
      )
      const beer = await beerRepository.insertBeer(
        trx,
        {
          name: 'Pils'
        }
      )
      await beerRepository.insertBeerBreweries(
        trx,
        [{ beer: beer.id, brewery: brewery.id }]
      )
      await beerRepository.insertBeerStyles(
        trx,
        [{ beer: beer.id, style: style.id }]
      )
      const container = await containerRepository.insertContainer(
        trx,
        {
          type: 'Can',
          size: '0.25'
        }
      )
      return await storageRepository.insertStorage(
        trx,
        {
          beer: beer.id,
          bestBefore: '2024-12-02T12:12:12.000Z',
          container: container.id
        }
      )
    })
  }

  it('lock storage that exists', async () => {
    const storage = await createStorage()
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(
        trx,
        storage.id
      )
      assertEqual(lockedKey, storage.id)
    })
  })

  it('storage does not have review', async () => {
    const storage = await createStorage()
    const found = await storageRepository.findStorageById(
      ctx.db,
      storage.id
    )
    assertEqual(found?.hasReview, false)
  })

  it('storages have reviews', async () => {
    const noReviewStorage = await createStorage()
    const { data } = await insertMultipleReviews(5, ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.insertStorage(
        trx,
        {
          beer: data.otherBeer.id,
          bestBefore: '2023-12-02T12:12:12.000Z',
          container: data.container.id
        }
      )
      await storageRepository.insertStorage(
        trx,
        {
          beer: data.beer.id,
          bestBefore: '2022-12-02T12:12:12.000Z',
          container: data.container.id
        }
      )
    })
    const results = await storageRepository.listStorages(
      ctx.db,
      { skip: 0, size: 20 }
    )
    assertEqual(results.length, 3)
    const [ beerResult, otherBeerResult, noReviewResult ] = results
    assertEqual(beerResult.beerId, data.beer.id)
    assertEqual(beerResult.hasReview, true)
    assertEqual(otherBeerResult.beerId, data.otherBeer.id)
    assertEqual(otherBeerResult.hasReview, true)
    assertEqual(noReviewResult.beerId, noReviewStorage.beer)
    assertEqual(noReviewResult.hasReview, false)
  })

  it('delete storage', async () => {
    const storage = await createStorage()
    const createdStorage =
      await storageRepository.findStorageById(ctx.db, storage.id)
    assert.notEqual(createdStorage, undefined)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.deleteStorageById(
        trx,
        storage.id
      )
    })
    const deletedStorage =
      await storageRepository.findStorageById(ctx.db, storage.id)
    assertEqual(deletedStorage, undefined)
  })

  it('do not lock storage that does not exists', async () => {
    const dummyId = 'a3386d9d-cf3f-4ae9-9101-493a117a5458'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(
        trx,
        dummyId
      )
      assertEqual(lockedKey, undefined)
    })
  })
})
