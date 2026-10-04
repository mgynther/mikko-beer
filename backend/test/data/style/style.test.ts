import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { assertLockHoldsOffWrite } from '../lock.js'
import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { buildNewStyle } from './builders.js'
import type {
  Style,
  StyleRelationship,
} from '../../../src/data/style/style.repository.js'

suite('style tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('return undefined on style that does not exist', async () => {
    const readStyle = await styleRepository.findStyleById(
      ctx.db,
      'e58a370e-7526-47e3-9c3d-da6a2c0ec5bd',
    )
    assertEqual(readStyle, undefined)
  })

  test('find style by id', async () => {
    const style = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await styleRepository.insertStyle(trx, {
          name: 'Imperial Stout',
        })
      },
    )
    const readStyle = await styleRepository.findStyleById(ctx.db, style.id)
    assertDeepEqual(readStyle, {
      ...style,
      children: [],
      parents: [],
    })
  })

  interface CreatedStyles {
    parent: Style
    child: Style
    relationships: StyleRelationship[]
  }

  async function createStyles(db: Database): Promise<CreatedStyles> {
    const insertedStyles = await db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await Promise.all([
          styleRepository.insertStyle(trx, { name: 'Imperial Stout' }),
          styleRepository.insertStyle(trx, { name: 'Stout' }),
        ])
      },
    )
    const relationships = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await styleRepository.insertStyleRelationships(trx, [
          {
            parent: insertedStyles[1].id,
            child: insertedStyles[0].id,
          },
        ])
      },
    )
    return {
      parent: insertedStyles[1],
      child: insertedStyles[0],
      relationships: relationships,
    }
  }

  test('list style relationships', async () => {
    const styles = await createStyles(ctx.db)
    assertDeepEqual(styles.relationships, [
      {
        parent: styles.parent.id,
        child: styles.child.id,
      },
    ])
    const styleRelationships = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return styleRepository.listStyleRelationships(trx)
      },
    )
    assertDeepEqual(styleRelationships, [
      {
        parent: styles.parent.id,
        child: styles.child.id,
      },
    ])
  })

  test('delete style relationships', async () => {
    const styles = await createStyles(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await styleRepository.deleteStyleChildRelationships(trx, styles.child.id)
    })
    const styleRelationships = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return styleRepository.listStyleRelationships(trx)
      },
    )
    assertDeepEqual(styleRelationships, [])
  })

  test('delete the parent relationships of the given style only', async () => {
    const [ale, lager, creamAle, kentucky, ipa] = await insertStyles([
      'Ale',
      'Lager',
      'Cream Ale',
      'Kentucky Common',
      'IPA',
    ])
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await styleRepository.insertStyleRelationships(trx, [
        { parent: ale.id, child: creamAle.id },
        { parent: lager.id, child: creamAle.id },
        { parent: creamAle.id, child: kentucky.id },
        { parent: ale.id, child: ipa.id },
      ])
      await styleRepository.deleteStyleChildRelationships(trx, creamAle.id)
    })
    const styleRelationships = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await styleRepository.listStyleRelationships(trx),
    )
    assertDeepEqual(
      styleRelationships.toSorted(
        (a: StyleRelationship, b: StyleRelationship) =>
          a.child < b.child ? -1 : 1,
      ),
      [
        { parent: creamAle.id, child: kentucky.id },
        { parent: ale.id, child: ipa.id },
      ].toSorted((a: StyleRelationship, b: StyleRelationship) =>
        a.child < b.child ? -1 : 1,
      ),
    )
  })

  test('update style', async () => {
    const style = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await styleRepository.insertStyle(trx, { name: 'IAP' })
      },
    )
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await styleRepository.updateStyle(trx, {
          ...style,
          name: 'IPA',
        })
      },
    )
    assertDeepEqual(updated, {
      ...style,
      name: 'IPA',
    })
  })

  test('update the given style only', async () => {
    const [iap, lager] = await insertStyles(['IAP', 'Lager'])
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await styleRepository.updateStyle(trx, { ...iap, name: 'IPA' }),
    )
    const readStyle = await styleRepository.findStyleById(ctx.db, lager.id)
    assertDeepEqual(readStyle, { ...lager, children: [], parents: [] })
  })

  test('update style that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await styleRepository.updateStyle(trx, {
          id: '7d1e4b9a-6c3f-4e2a-8b5d-9f0a1c6e3b74',
          name: 'Lambic',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('lock only style that exists', async () => {
    const style = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await styleRepository.insertStyle(trx, { name: 'Helles' })
      },
    )
    const dummyId = '778fd028-62a4-4a8a-a636-3e5db5475df2'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKeys = await styleRepository.lockStyles(trx, [
        style.id,
        dummyId,
      ])
      assertDeepEqual(lockedKeys, [style.id])
    })
  })

  test('lock several styles', async () => {
    const styles = await insertStyles(['Ale', 'Lager'])
    const lockedKeys = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await styleRepository.lockStyles(
          trx,
          styles.map((style: Style) => style.id),
        ),
    )
    assertDeepEqual(
      lockedKeys.toSorted(),
      styles.map((style: Style) => style.id).toSorted(),
    )
  })

  test('keep a locked style from being updated until the transaction ends', async () => {
    const [style] = await insertStyles(['IAP'])
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await styleRepository.lockStyles(trx, [style.id]),
      async (trx: Transaction) =>
        await styleRepository.updateStyle(trx, { ...style, name: 'IPA' }),
    )
  })

  test('list styles', async () => {
    const insertedStyles = await createStyles(ctx.db)
    const styles = await styleRepository.listStyles(ctx.db)
    assertDeepEqual(styles, [
      {
        ...insertedStyles.child,
        parents: [insertedStyles.parent.id],
      },
      {
        ...insertedStyles.parent,
        parents: [],
      },
    ])
  })

  test('list a style with two parents once, the parents by name', async () => {
    const { creamAle, ale, lager } = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [creamAle, ale, lager] = await Promise.all(
          ['Cream Ale', 'Ale', 'Lager'].map((name) =>
            styleRepository.insertStyle(trx, buildNewStyle({ name })),
          ),
        )
        // Related in reverse order of their names.
        await styleRepository.insertStyleRelationships(trx, [
          { parent: lager.id, child: creamAle.id },
          { parent: ale.id, child: creamAle.id },
        ])
        return { creamAle, ale, lager }
      },
    )
    const styles = await styleRepository.listStyles(ctx.db)
    assertDeepEqual(styles, [
      { ...ale, parents: [] },
      { ...creamAle, parents: [ale.id, lager.id] },
      { ...lager, parents: [] },
    ])
  })

  test('do not list styles when there are none', async () => {
    const styles = await styleRepository.listStyles(ctx.db)
    assertDeepEqual(styles, [])
  })

  test('find style with its parents and children by name', async () => {
    const { creamAle, parents, children } =
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        const [creamAle, lager, ale, kentucky, genesee] = await Promise.all(
          ['Cream Ale', 'Lager', 'Ale', 'Kentucky Common', 'Genesee'].map(
            (name) => styleRepository.insertStyle(trx, buildNewStyle({ name })),
          ),
        )
        // Related in reverse order of their names.
        await styleRepository.insertStyleRelationships(trx, [
          { parent: lager.id, child: creamAle.id },
          { parent: ale.id, child: creamAle.id },
          { parent: creamAle.id, child: kentucky.id },
          { parent: creamAle.id, child: genesee.id },
        ])
        return {
          creamAle,
          parents: [ale, lager],
          children: [genesee, kentucky],
        }
      })
    const found = await styleRepository.findStyleById(ctx.db, creamAle.id)
    assertDeepEqual(found?.parents, parents)
    assertDeepEqual(found?.children, children)
  })
  async function insertStyles(names: string[]): Promise<Style[]> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await Promise.all(
          names.map(
            async (name: string) =>
              await styleRepository.insertStyle(trx, buildNewStyle({ name })),
          ),
        ),
    )
  }
})
