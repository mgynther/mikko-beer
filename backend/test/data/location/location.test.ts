import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { Transaction } from '../../../src/data/database'
import * as locationRepository from '../../../src/data/location/location.repository'

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
    expect(readLocation).toEqual(location)
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
    expect(updated).toEqual({
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
      expect(lockedKeys).toEqual([location.id])
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
    expect(locations).toEqual([location])
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
    expect(locations).toEqual([location])
  })
})
