import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { Storage } from '../../../src/core/storage/storage'
import { type Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as storageRepository from '../../../src/data/storage/storage.repository'
import * as styleRepository from '../../../src/data/style/style.repository'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createStorage(): Promise<Storage> {
    return await ctx.db.executeTransaction(async (
      trx: Transaction
    ): Promise<Storage> => {
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
          bestBefore: new Date(),
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
