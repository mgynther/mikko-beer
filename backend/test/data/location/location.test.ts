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
import * as locationRepository from '../../../src/data/location/location.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'

suite('location tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('find location by id', async () => {
    const location = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.insertLocation(trx, { name: 'Huurre' })
      },
    )
    const readLocation = await locationRepository.findLocationById(
      ctx.db,
      location.id,
    )
    assertDeepEqual(readLocation, location)
  })

  test('find location that does not exist', async () => {
    const readLocation = await locationRepository.findLocationById(
      ctx.db,
      'b33cd516-02ab-4659-9b2c-8f7e891ba219',
    )
    assertEqual(readLocation, undefined)
  })

  test('update location', async () => {
    const location = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.insertLocation(trx, { name: 'Plenva' })
      },
    )
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.updateLocation(trx, {
          ...location,
          name: 'Plevna',
        })
      },
    )
    assertDeepEqual(updated, {
      ...location,
      name: 'Plevna',
    })
  })

  test('update location that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await locationRepository.updateLocation(trx, {
          id: '5b0e3cde-8d6f-4f05-a7d7-1f0f2a0e4b8a',
          name: 'Kuja',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('lock only location that exists', async () => {
    const location = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.insertLocation(trx, {
          name: 'Oluthuone Panimomestari',
        })
      },
    )
    const dummyId = '7609cc26-f765-4d7e-983b-bed4a8e67c54'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKeys = await locationRepository.lockLocations(trx, [
        location.id,
        dummyId,
      ])
      assertDeepEqual(lockedKeys, [location.id])
    })
  })

  test('list locations', async () => {
    const location = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.insertLocation(trx, {
          name: 'Pyynikin Brewhouse',
        })
      },
    )
    const locations = await locationRepository.listLocations(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(locations, [location])
  })

  test('search locations', async () => {
    const location = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await locationRepository.insertLocation(trx, {
          name: 'Kahdet kasvot',
        })
      },
    )
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: 'kahd',
    })
    assertDeepEqual(locations, [location])
  })
})
