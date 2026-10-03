import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'

suite('container tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('find container by id', async () => {
    const container = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await containerRepository.insertContainer(trx, {
          size: '0.33',
          type: 'can',
        })
      },
    )
    const readContainer = await containerRepository.findContainerById(
      ctx.db,
      container.id,
    )
    assertDeepEqual(readContainer, container)
  })

  test('find container that does not exist', async () => {
    const readContainer = await containerRepository.findContainerById(
      ctx.db,
      'e1480b16-477c-49a7-b0ae-e1940b183966',
    )
    assertEqual(readContainer, undefined)
  })

  test('update container', async () => {
    const container = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await containerRepository.insertContainer(trx, {
          size: '0.43',
          type: 'can',
        })
      },
    )
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await containerRepository.updateContainer(trx, {
          ...container,
          size: '0.44',
          type: 'can',
        })
      },
    )
    assertDeepEqual(updated, {
      ...container,
      size: '0.44',
      type: 'can',
    })
  })

  test('update container that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await containerRepository.updateContainer(trx, {
          id: '9e2f6a1b-7c4d-4e8f-b3a5-6d1c0f9e8b27',
          type: 'bottle',
          size: '0.33',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('lock container that exists', async () => {
    const container = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await containerRepository.insertContainer(trx, {
          type: 'Bottle',
          size: '0.33',
        })
      },
    )
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await containerRepository.lockContainer(
        trx,
        container.id,
      )
      assertEqual(lockedKey, container.id)
    })
  })

  test('do not lock container that does not exists', async () => {
    const dummyId = '296bc6bb-f250-4cb3-9e66-a54257c2e0ab'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await containerRepository.lockContainer(trx, dummyId)
      assertEqual(lockedKey, undefined)
    })
  })

  test('list containers', async () => {
    const container = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await containerRepository.insertContainer(trx, {
          size: '0.43',
          type: 'can',
        })
      },
    )
    const containers = await containerRepository.listContainers(ctx.db)
    assertDeepEqual(containers, [container])
  })
})
