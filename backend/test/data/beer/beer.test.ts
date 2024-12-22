import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'

describe('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock beer that exists', async () => {
    const beer = await ctx.db.executeTransaction(async (trx: Transaction) => {
      return await beerRepository.insertBeer(trx, { name: 'Weizenbock' })
    })
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        beer.id
      )
      expect(lockedKey).toEqual(beer.id)
    })
  })

  it('do not lock beer that does not exists', async () => {
    const dummyId = '48c92e78-f24b-44bb-901e-02116ca9214e'
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        dummyId
      )
      expect(lockedKey).toEqual(undefined)
    })
  })
})
