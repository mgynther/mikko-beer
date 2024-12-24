import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { StorageWithDate } from '../../../src/core/storage/storage'
import type { Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as storageRepository from '../../../src/data/storage/storage.repository'
import * as styleRepository from '../../../src/data/style/style.repository'
import { insertMultipleReviews } from '../review-helpers'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(): Promise<StorageWithDate> {
    return await ctx.db.executeTransaction(async (
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
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(
        trx,
        storage.id
      )
      expect(lockedKey).toEqual(storage.id)
    })
  })

  it('storage does not have review', async () => {
    const storage = await createStorage()
    const found = await storageRepository.findStorageById(
      ctx.db,
      storage.id
    )
    expect(found?.hasReview).toEqual(false)
  })

  it('storages have reviews', async () => {
    const noReviewStorage = await createStorage()
    const { data } = await insertMultipleReviews(5, ctx.db)
    await ctx.db.executeTransaction(async (trx: Transaction) => {
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
    expect(results.length).toEqual(3)
    const [ beerResult, otherBeerResult, noReviewResult ] = results
    expect(beerResult.beerId).toEqual(data.beer.id)
    expect(beerResult.hasReview).toEqual(true)
    expect(otherBeerResult.beerId).toEqual(data.otherBeer.id)
    expect(otherBeerResult.hasReview).toEqual(true)
    expect(noReviewResult.beerId).toEqual(noReviewStorage.beer)
    expect(noReviewResult.hasReview).toEqual(false)
  })

  it('delete storage', async () => {
    const storage = await createStorage()
    const createdStorage =
      await storageRepository.findStorageById(ctx.db, storage.id)
    expect(createdStorage).not.toEqual(undefined)
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      await storageRepository.deleteStorageById(
        trx,
        storage.id
      )
    })
    const deletedStorage =
      await storageRepository.findStorageById(ctx.db, storage.id)
    expect(deletedStorage).toEqual(undefined)
  })

  it('do not lock storage that does not exists', async () => {
    const dummyId = 'a3386d9d-cf3f-4ae9-9101-493a117a5458'
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(
        trx,
        dummyId
      )
      expect(lockedKey).toEqual(undefined)
    })
  })
})
