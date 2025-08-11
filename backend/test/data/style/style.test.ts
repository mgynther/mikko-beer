import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as styleRepository from '../../../src/data/style/style.repository'
import { assertDeepEqual } from '../../assert'

describe('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock only style that exists', async () => {
    const style = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await styleRepository.insertStyle(trx, { name: 'Helles' })
    })
    const dummyId = '778fd028-62a4-4a8a-a636-3e5db5475df2'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKeys = await styleRepository.lockStyles(
        trx,
        [style.id, dummyId]
      )
      assertDeepEqual(lockedKeys, [style.id])
    })
  })
})
