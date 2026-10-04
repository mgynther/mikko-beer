import { suite, test, before, beforeEach, after, afterEach } from '../test.js'

import { buildNewContainer } from './container/builders.js'
import { assertLockHoldsOffWrite } from './lock.js'
import { TestContext } from './test-context.js'
import type { Container } from '../../src/data/container/container.repository.js'
import * as containerRepository from '../../src/data/container/container.repository.js'
import type { Transaction } from '../../src/data/database.js'
import { assertRejectsWithMessage } from '../assert.js'

suite('lock', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function insertContainer(): Promise<Container> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await containerRepository.insertContainer(trx, buildNewContainer()),
    )
  }

  async function updateContainer(
    trx: Transaction,
    container: Container,
  ): Promise<void> {
    await containerRepository.updateContainer(trx, {
      ...container,
      size: '0.50',
    })
  }

  test('passes when the lock holds off the write', async () => {
    const container = await insertContainer()
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await containerRepository.lockContainer(trx, container.id),
      async (trx: Transaction) => {
        await updateContainer(trx, container)
      },
    )
  })

  test('fails when nothing holds off the write', async () => {
    const container = await insertContainer()
    await assertRejectsWithMessage(async () => {
      await assertLockHoldsOffWrite(
        ctx.db,
        async () => undefined,
        async (trx: Transaction) => {
          await updateContainer(trx, container)
        },
      )
    }, 'Expected values to be strictly deep-equal')
  })
})
