import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import { assertEqual } from '../../assert'

describe('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock beer that exists', async () => {
    const beer = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await beerRepository.insertBeer(trx, { name: 'Weizenbock' })
    })
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        beer.id
      )
      assertEqual(lockedKey, beer.id)
    })
  })

  it('do not lock beer that does not exists', async () => {
    const dummyId = '48c92e78-f24b-44bb-901e-02116ca9214e'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        dummyId
      )
      assertEqual(lockedKey, undefined)
    })
  })
})
