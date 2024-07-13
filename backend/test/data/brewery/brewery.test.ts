import { expect } from 'earl'

import { TestContext } from '../test-context'
import { type Transaction } from '../../../src/data/database'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'

describe('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock only brewery that exists', async () => {
    const brewery = await ctx.db.executeTransaction(async (trx: Transaction) => {
      return await breweryRepository.insertBrewery(
        trx,
        { name: 'Nokian panimo' }
      )
    })
    const dummyId = 'f39e637b-48e3-4790-88cc-ec8d57ff219d'
    await ctx.db.executeTransaction(async (trx: Transaction) => {
      const lockedKeys = await breweryRepository.lockBreweries(
        trx,
        [brewery.id, dummyId]
      )
      expect(lockedKeys).toEqual([brewery.id])
    })
  })
})
