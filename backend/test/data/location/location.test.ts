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
import type { Location } from '../../../src/data/location/location.repository.js'
import { defaultSearchMaxResults } from '../../../src/data/search.js'
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

  test('update the given location only', async () => {
    const [plevna, huurre] = await insertLocations(['Plevna', 'Huurre'])
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await locationRepository.updateLocation(trx, {
          ...plevna,
          name: 'Plevna Panimoravintola',
        }),
    )
    const readLocation = await locationRepository.findLocationById(
      ctx.db,
      huurre.id,
    )
    assertDeepEqual(readLocation, huurre)
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

  test('lock several locations', async () => {
    const locations = await insertLocations(['Plevna', 'Huurre'])
    const lockedKeys = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await locationRepository.lockLocations(
          trx,
          locations.map((location: Location) => location.id),
        ),
    )
    assertDeepEqual(
      lockedKeys.toSorted(),
      locations.map((location: Location) => location.id).toSorted(),
    )
  })

  test('keep a locked location from being updated until the transaction ends', async () => {
    const [location] = await insertLocations(['Plenva'])
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await locationRepository.lockLocations(trx, [location.id]),
      async (trx: Transaction) =>
        await locationRepository.updateLocation(trx, {
          ...location,
          name: 'Plevna',
        }),
    )
  })

  test('list locations by name', async () => {
    const [plevna, huurre, kuja] = await insertLocations([
      'Plevna',
      'Huurre',
      'Kuja',
    ])
    const locations = await locationRepository.listLocations(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(locations, [huurre, kuja, plevna])
  })

  test('list a page of locations', async () => {
    const [plevna, , kuja] = await insertLocations([
      'Plevna',
      'Huurre',
      'Kuja',
      'Teerenpeli',
    ])
    const locations = await locationRepository.listLocations(ctx.db, {
      size: 2,
      skip: 1,
    })
    assertDeepEqual(locations, [kuja, plevna])
  })

  test('do not list locations when there are none', async () => {
    const locations = await locationRepository.listLocations(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(locations, [])
  })

  test('search locations by part of the name', async () => {
    const [, plevna] = await insertLocations(['Huurre', 'Plevna'])
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: 'evn',
    })
    assertDeepEqual(locations, [plevna])
  })

  test('search locations ignoring case', async () => {
    const [plevna] = await insertLocations(['Plevna', 'Huurre'])
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: 'pLEVNA',
    })
    assertDeepEqual(locations, [plevna])
  })

  test('search locations by an exact name', async () => {
    const [, kuja] = await insertLocations(['Kujakolli', 'Kuja'])
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: '"kuja"',
    })
    assertDeepEqual(locations, [kuja])
  })

  test('search locations by name', async () => {
    const [panimomestari, , panimoravintola] = await insertLocations([
      'Oluthuone Panimomestari',
      'Kahdet kasvot',
      'Plevna Panimoravintola',
    ])
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: 'panimo',
    })
    assertDeepEqual(locations, [panimomestari, panimoravintola])
  })

  test('search the first locations by name up to the maximum', async () => {
    const names = Array.from(
      { length: defaultSearchMaxResults + 1 },
      (_: unknown, index: number) => `Bar ${String(index).padStart(2, '0')}`,
    )
    await insertLocations(names.toReversed())
    const locations = await locationRepository.searchLocations(ctx.db, {
      name: 'bar',
    })
    assertDeepEqual(
      locations.map((location: Location) => location.name),
      names.slice(0, defaultSearchMaxResults),
    )
  })

  async function insertLocations(names: string[]): Promise<Location[]> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await Promise.all(
          names.map(
            async (name: string) =>
              await locationRepository.insertLocation(trx, { name }),
          ),
        ),
    )
  }
})
