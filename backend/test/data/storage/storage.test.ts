import { expect } from 'earl'

import { TestContext } from '../test-context'
import { type Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as storageRepository from '../../../src/data/storage/storage.repository'

describe('storage tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock storage that exists', async () => {
    const storage = await ctx.db.executeTransaction(async (trx: Transaction) => {
      const beer = await beerRepository.insertBeer(
        trx,
        {
          name: 'Pils'
        }
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
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKey = await storageRepository.lockStorage(
        trx,
        storage.id
      )
      expect(lockedKey).toEqual(storage.id)
    })
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
