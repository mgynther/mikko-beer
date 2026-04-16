import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import { assertDeepEqual } from '../../assert.js'

describe('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('find brewery by id', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
        })
      },
    )
    const readBrewery = await breweryRepository.findBreweryById(
      ctx.db,
      brewery.id,
    )
    assertDeepEqual(readBrewery, brewery)
  })

  it('find brewery that does not exist', async () => {
    const readBrewery = await breweryRepository.findBreweryById(
      ctx.db,
      'a3047606-807c-4550-8b14-8ec13dd03cdb',
    )
    assertDeepEqual(readBrewery, undefined)
  })

  it('update brewery', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Beer unters',
        })
      },
    )
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...brewery,
          name: 'Beer Hunters',
        })
      },
    )
    assertDeepEqual(updated, {
      ...brewery,
      name: 'Beer Hunters',
    })
  })

  it('lock only brewery that exists', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Nokian panimo',
        })
      },
    )
    const dummyId = 'f39e637b-48e3-4790-88cc-ec8d57ff219d'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKeys = await breweryRepository.lockBreweries(trx, [
        brewery.id,
        dummyId,
      ])
      assertDeepEqual(lockedKeys, [brewery.id])
    })
  })

  it('list breweries', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Panimo Himo',
        })
      },
    )
    const breweries = await breweryRepository.listBreweries(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(breweries, [brewery])
  })

  it('search breweries', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Atmos Brewing',
        })
      },
    )
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'atmo',
    })
    assertDeepEqual(breweries, [brewery])
  })
})
