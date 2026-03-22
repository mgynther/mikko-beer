import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as locationRepository from '../../../src/data/location/location.repository'
import { assertDeepEqual, assertEqual } from '../../assert'

describe('location tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('find location by id', async () => {
    const location = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.insertLocation(
        trx,
        { name: 'Huurre' }
      )
    })
    const readLocation = await locationRepository.findLocationById(
      ctx.db,
      location.id
    )
    assertDeepEqual(readLocation, location)
  })

  it('find location that does not exist', async () => {
    const readLocation = await locationRepository.findLocationById(
      ctx.db,
      'b33cd516-02ab-4659-9b2c-8f7e891ba219'
    )
    assertEqual(readLocation, undefined)
  })

  it('update location', async () => {
    const location = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.insertLocation(
        trx,
        { name: 'Plenva' }
      )
    })
    const updated = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.updateLocation(
        trx,
        {
          ...location,
          name: 'Plevna'
        }
      )
    })
    assertDeepEqual(updated, {
      ...location,
      name: 'Plevna'
    })
  })

  it('lock only location that exists', async () => {
    const location = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.insertLocation(
        trx,
        { name: 'Oluthuone Panimomestari' }
      )
    })
    const dummyId = '7609cc26-f765-4d7e-983b-bed4a8e67c54'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKeys = await locationRepository.lockLocations(
        trx,
        [location.id, dummyId]
      )
      assertDeepEqual(lockedKeys, [location.id])
    })
  })

  it('list locations', async () => {
    const location = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.insertLocation(
        trx,
        { name: 'Pyynikin Brewhouse' }
      )
    })
    const locations = await locationRepository.listLocations(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(locations, [location])
  })

  it('search locations', async () => {
    const location = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await locationRepository.insertLocation(
        trx,
        { name: 'Kahdet kasvot' }
      )
    })
    const locations = await locationRepository.searchLocations(
      ctx.db,
      { name: 'kahd' }
    )
    assertDeepEqual(locations, [location])
  })
})
