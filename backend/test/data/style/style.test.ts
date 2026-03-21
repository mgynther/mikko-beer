import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Database, Transaction } from '../../../src/data/database'
import * as styleRepository from '../../../src/data/style/style.repository'
import { assertDeepEqual } from '../../assert'
import type { Style, StyleRelationship } from '../../../src/core/style/style'

describe('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('find style by id', async () => {
    const style = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await styleRepository.insertStyle(
        trx,
        { name: 'Imperial Stout' }
      )
    })
    const readStyle = await styleRepository.findStyleById(
      ctx.db,
      style.id
    )
    assertDeepEqual(
      readStyle,
      {
        ...style,
        children: [],
        parents: []
      }
    )
  })

  interface CreatedStyles {
    parent: Style,
    child: Style,
    relationships: StyleRelationship[]
  }

  async function createStyles(db: Database): Promise<CreatedStyles> {
    const insertedStyles = await db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await Promise.all([
        styleRepository.insertStyle(
          trx,
          { name: 'Imperial Stout' }
        ),
        styleRepository.insertStyle(
          trx,
          { name: 'Stout' }
        )
      ])
    })
    const relationships = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await styleRepository.insertStyleRelationships(
        trx,
        [
          {
            parent: insertedStyles[1].id,
            child: insertedStyles[0].id
          }
        ]
      )
    })
    return {
      parent: insertedStyles[1],
      child: insertedStyles[0],
      relationships: relationships
    }
  }

  it('list style relationships', async () => {
    const styles = await createStyles(ctx.db)
    assertDeepEqual(
      styles.relationships,
      [
        {
          parent: styles.parent.id,
          child: styles.child.id
        }
      ]
    )
    const styleRelationships = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return styleRepository.listStyleRelationships(trx)
    })
    assertDeepEqual(
      styleRelationships,
      [
        {
          parent: styles.parent.id,
          child: styles.child.id
        }
      ]
    )
  })

  it('delete style relationships', async () => {
    const styles = await createStyles(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      await styleRepository.deleteStyleChildRelationships(trx, styles.child.id)
    })
    const styleRelationships = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return styleRepository.listStyleRelationships(trx)
    })
    assertDeepEqual(
      styleRelationships,
      []
    )
  })

  it('update style', async () => {
    const style = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await styleRepository.insertStyle(
        trx,
        { name: 'IAP' }
      )
    })
    const updated = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await styleRepository.updateStyle(
        trx,
        {
          ...style,
          name: 'IPA'
        }
      )
    })
    assertDeepEqual(updated, {
      ...style,
      name: 'IPA'
    })
  })

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

  it('list styles', async () => {
    const insertedStyles = await createStyles(ctx.db)
    const styles = await styleRepository.listStyles(ctx.db)
    assertDeepEqual(
      styles,
      [

        {
          ...insertedStyles.child,
          parents: [insertedStyles.parent.id]
        },
        {
          ...insertedStyles.parent,
          parents: []
        }
      ])
  })
})
