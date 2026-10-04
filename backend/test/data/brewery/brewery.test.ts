import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { buildNewBrewery } from './builders.js'
import { assertLockHoldsOffWrite } from '../lock.js'
import { TestContext } from '../test-context.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import { defaultSearchMaxResults } from '../../../src/data/search.js'
import type { Transaction } from '../../../src/data/database.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import {
  assertDeepEqual,
  assertEqual,
  assertRejectsWithMessage,
} from '../../assert.js'

suite('brewery tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('insert brewery with country', async () => {
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

  test('insert brewery without country', async () => {
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

  test('update brewery country', async () => {
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
          ...brewery,
          country: 'BE',
        })
      },
    )
    assertDeepEqual(changedCountry, { ...brewery, country: 'BE' })

    const clearedCountry = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await breweryRepository.updateBrewery(trx, {
          ...brewery,
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

  test('reject invalid country in database', async () => {
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

  test('reject invalid country on update in database', async () => {
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

  test('find brewery by id', async () => {
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

  test('find brewery that does not exist', async () => {
    const readBrewery = await breweryRepository.findBreweryById(
      ctx.db,
      'a3047606-807c-4550-8b14-8ec13dd03cdb',
    )
    assertDeepEqual(readBrewery, undefined)
  })

  test('update brewery', async () => {
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

  test('update the given brewery only', async () => {
    const [koskipanimo, plevna] = await insertBreweries([
      'Koskipanimo',
      'Plevna',
    ])
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await breweryRepository.updateBrewery(trx, {
          ...koskipanimo,
          country: 'FI',
        }),
    )
    const readBrewery = await breweryRepository.findBreweryById(
      ctx.db,
      plevna.id,
    )
    assertDeepEqual(readBrewery, plevna)
  })

  test('update brewery that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await breweryRepository.updateBrewery(trx, {
          id: '0c4d8e7a-3b52-4f6e-9a1d-2e7f5c8b9a03',
          name: 'Lindemans',
          country: 'BE',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('lock only brewery that exists', async () => {
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

  test('lock several breweries', async () => {
    const breweries = await insertBreweries(['Koskipanimo', 'Plevna'])
    const lockedKeys = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await breweryRepository.lockBreweries(
          trx,
          breweries.map((brewery: Brewery) => brewery.id),
        ),
    )
    assertDeepEqual(
      lockedKeys.toSorted(),
      breweries.map((brewery: Brewery) => brewery.id).toSorted(),
    )
  })

  test('keep a locked brewery from being updated until the transaction ends', async () => {
    const [brewery] = await insertBreweries(['Beer unters'])
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await breweryRepository.lockBreweries(trx, [brewery.id]),
      async (trx: Transaction) =>
        await breweryRepository.updateBrewery(trx, {
          ...brewery,
          name: 'Beer Hunters',
        }),
    )
  })

  test('list breweries by name', async () => {
    const [plevna, himo, koskipanimo] = await insertBreweries([
      'Plevna',
      'Panimo Himo',
      'Koskipanimo',
    ])
    const breweries = await breweryRepository.listBreweries(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(breweries, [koskipanimo, himo, plevna])
  })

  test('list a page of breweries', async () => {
    const [plevna, himo] = await insertBreweries([
      'Plevna',
      'Panimo Himo',
      'Koskipanimo',
      'Sori Brewing',
    ])
    const breweries = await breweryRepository.listBreweries(ctx.db, {
      size: 2,
      skip: 1,
    })
    assertDeepEqual(breweries, [himo, plevna])
  })

  test('do not list breweries when there are none', async () => {
    const breweries = await breweryRepository.listBreweries(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(breweries, [])
  })

  test('search breweries by part of the name', async () => {
    const [atmos] = await insertBreweries(['Atmos Brewing', 'Plevna'])
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'mos',
    })
    assertDeepEqual(breweries, [atmos])
  })

  test('search breweries ignoring case', async () => {
    const [plevna] = await insertBreweries(['Plevna', 'Koskipanimo'])
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'pLEVNA',
    })
    assertDeepEqual(breweries, [plevna])
  })

  test('search breweries by an exact name', async () => {
    const [, mikkeller] = await insertBreweries([
      'Mikkeller Baghaven',
      'Mikkeller',
    ])
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: '"mikkeller"',
    })
    assertDeepEqual(breweries, [mikkeller])
  })

  test('search breweries by name', async () => {
    const [sori, , atmos] = await insertBreweries([
      'Sori Brewing',
      'Plevna',
      'Atmos Brewing',
    ])
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'brewing',
    })
    assertDeepEqual(breweries, [atmos, sori])
  })

  test('search the first breweries by name up to the maximum', async () => {
    const names = Array.from(
      { length: defaultSearchMaxResults + 1 },
      (_: unknown, index: number) =>
        `Brewery ${String(index).padStart(2, '0')}`,
    )
    await insertBreweries(names.toReversed())
    const breweries = await breweryRepository.searchBreweries(ctx.db, {
      name: 'brewery',
    })
    assertDeepEqual(
      breweries.map((brewery: Brewery) => brewery.name),
      names.slice(0, defaultSearchMaxResults),
    )
  })

  async function insertBreweries(names: string[]): Promise<Brewery[]> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await Promise.all(
          names.map(
            async (name: string) =>
              await breweryRepository.insertBrewery(
                trx,
                buildNewBrewery({ name }),
              ),
          ),
        ),
    )
  }
})
