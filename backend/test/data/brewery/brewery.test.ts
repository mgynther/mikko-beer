import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import {
  assertDeepEqual,
  assertEqual,
  assertRejectsWithMessage,
} from '../../assert.js'

describe('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('insert brewery with country', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
          country: 'FI',
        })
      },
    )
    assertEqual(brewery.country, 'FI')
    const readBrewery = await breweryRepository.findBreweryById(
      ctx.db,
      brewery.id,
    )
    assertDeepEqual(readBrewery, brewery)
  })

  it('insert brewery without country', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
          country: undefined,
        })
      },
    )
    assertDeepEqual(brewery, {
      id: brewery.id,
      name: 'Koskipanimo',
      country: undefined,
    })
  })

  it('update brewery country', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
          country: undefined,
        })
      },
    )
    assertEqual(brewery.country, undefined)

    const withCountry = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...brewery,
          country: 'FI',
        })
      },
    )
    assertDeepEqual(withCountry, { ...brewery, country: 'FI' })

    const changedCountry = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...withCountry,
          country: 'BE',
        })
      },
    )
    assertDeepEqual(changedCountry, { ...brewery, country: 'BE' })

    const clearedCountry = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...changedCountry,
          country: undefined,
        })
      },
    )
    assertDeepEqual(clearedCountry, { ...brewery, country: undefined })
    assertDeepEqual(
      await breweryRepository.findBreweryById(ctx.db, brewery.id),
      clearedCountry,
    )
  })

  it('reject invalid country in database', async () => {
    async function insert(country: string) {
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: `Brewery ${country}`,
          country,
        })
      })
    }

    // Wrong characters are rejected by the check constraint.
    await Promise.all(
      ['fi', 'Fi', 'F1', ' F', 'F'].map(
        async (country) =>
          await assertRejectsWithMessage(
            async () => await insert(country),
            'brewery_country_check',
          ),
      ),
    )

    // Too long values do not reach the check constraint, the column type
    // rejects them first.
    await assertRejectsWithMessage(
      async () => await insert('FIN'),
      'too long for type character varying(2)',
    )
  })

  it('reject invalid country on update in database', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
          country: 'FI',
        })
      },
    )
    await assertRejectsWithMessage(async () => {
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...brewery,
          country: 'fi',
        })
      })
    }, 'brewery_country_check')
  })

  it('find brewery by id', async () => {
    const brewery = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.insertBrewery(trx, {
          name: 'Koskipanimo',
          country: undefined,
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
          country: undefined,
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
          country: undefined,
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
          country: 'FI',
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
          country: 'FI',
        })
      },
    )
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'atmo',
    })
    assertDeepEqual(breweries, [brewery])
  })
})
