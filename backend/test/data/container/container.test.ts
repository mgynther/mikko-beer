import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as containerRepository from '../../../src/data/container/container.repository'

describe('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('lock container that exists', async () => {
    const container = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await containerRepository.insertContainer(
        trx,
        {
          type: 'Bottle',
          size: '0.33'
        }
      )
    })
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await containerRepository.lockContainer(
        trx,
        container.id
      )
      expect(lockedKey).toEqual(container.id)
    })
  })

  it('do not lock container that does not exists', async () => {
    const dummyId = '296bc6bb-f250-4cb3-9e66-a54257c2e0ab'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await containerRepository.lockContainer(
        trx,
        dummyId
      )
      expect(lockedKey).toEqual(undefined)
    })
  })
})
