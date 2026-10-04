import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Brewery } from '../../../src/data/beer/beer.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { buildNewBeer } from './builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewStyle } from '../style/builders.js'
import { assertLockHoldsOffWrite } from '../lock.js'
import type { BeerWithBreweriesAndStyles } from '../../../src/data/beer/beer.repository.js'
import { defaultSearchMaxResults } from '../../../src/data/search.js'

suite('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface CreateBeersResult {
    beers: Beer[]
    breweries: Brewery[]
    style: Style
  }

  async function createBeers(db: Database): Promise<CreateBeersResult> {
    return await db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<CreateBeersResult> => {
        const [
          severinBeer,
          smörreBeer,
          koskipanimoBrewery,
          fabrikenBrewery,
          style,
        ] = await Promise.all([
          beerRepository.insertBeer(trx, {
            name: 'Severin Extra IPA',
          }),
          beerRepository.insertBeer(trx, {
            name: 'Smörre Rye IPA',
          }),
          breweryRepository.insertBrewery(trx, {
            name: 'Koskipanimo',
            country: undefined,
          }),
          breweryRepository.insertBrewery(trx, {
            name: 'Ölfabrikenin',
            country: undefined,
          }),
          styleRepository.insertStyle(trx, {
            name: 'American IPA',
          }),
        ])
        await Promise.all([
          beerRepository.insertBeerBreweries(trx, [
            { beer: severinBeer.id, brewery: koskipanimoBrewery.id },
          ]),
          beerRepository.insertBeerStyles(trx, [
            { beer: severinBeer.id, style: style.id },
          ]),
          beerRepository.insertBeerBreweries(trx, [
            { beer: smörreBeer.id, brewery: koskipanimoBrewery.id },
            { beer: smörreBeer.id, brewery: fabrikenBrewery.id },
          ]),
          beerRepository.insertBeerStyles(trx, [
            { beer: smörreBeer.id, style: style.id },
          ]),
        ])
        return {
          beers: [severinBeer, smörreBeer],
          breweries: [koskipanimoBrewery, fabrikenBrewery].map((brewery) => ({
            id: brewery.id,
            name: brewery.name,
          })),
          style,
        }
      },
    )
  }

  test('find beer by id', async () => {
    const createResult = await createBeers(ctx.db)
    const readBeer = await beerRepository.findBeerById(
      ctx.db,
      createResult.beers[0].id,
    )
    assertDeepEqual(readBeer, {
      ...createResult.beers[0],
      breweries: [createResult.breweries[0]],
      styles: [createResult.style],
    })
  })

  test('find beer that does not exist', async () => {
    const readBeer = await beerRepository.findBeerById(
      ctx.db,
      'fda99507-46d0-4f6f-a3fe-85cffecd8762',
    )
    assertDeepEqual(readBeer, undefined)
  })

  test('update beer', async () => {
    const beer = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await beerRepository.insertBeer(trx, { name: 'Viikingi Kajre' })
      },
    )
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await beerRepository.updateBeer(trx, {
          ...beer,
          name: 'Viikingi Karje',
        })
      },
    )
    assertDeepEqual(updated, {
      ...beer,
      name: 'Viikingi Karje',
    })
  })

  test('update the given beer only', async () => {
    const [kajre, karhu] = await insertBeers(['Viikingi Kajre', 'Karhu'])
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await beerRepository.updateBeer(trx, {
          id: kajre.id,
          name: 'Viikingi Karje',
        }),
    )
    const readBeer = await beerRepository.findBeerById(ctx.db, karhu.id)
    assertDeepEqual(readBeer, karhu)
  })

  test('update beer that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await beerRepository.updateBeer(trx, {
          id: '3f7a9c2e-1d5b-4a8f-9e6c-0b4d2a7f1e58',
          name: 'Kriek',
        }),
    )
    assertEqual(updated, undefined)
  })

  test('lock beer that exists', async () => {
    const beer = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await beerRepository.insertBeer(trx, { name: 'Weizenbock' })
      },
    )
    const lockedKey = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const lockedKey = await beerRepository.lockBeer(trx, beer.id)
        return lockedKey
      },
    )
    assertEqual(lockedKey, beer.id)
  })

  test('do not lock beer that does not exists', async () => {
    const dummyId = '48c92e78-f24b-44bb-901e-02116ca9214e'
    const lockedKey = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        return await beerRepository.lockBeer(trx, dummyId)
      },
    )
    assertEqual(lockedKey, undefined)
  })

  test('keep a locked beer from being updated until the transaction ends', async () => {
    const [beer] = await insertBeers(['Viikingi Kajre'])
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) => await beerRepository.lockBeer(trx, beer.id),
      async (trx: Transaction) =>
        await beerRepository.updateBeer(trx, {
          id: beer.id,
          name: 'Viikingi Karje',
        }),
    )
  })

  test('empty beer list', async () => {
    const beers = await beerRepository.listBeers(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(beers, [])
  })

  test('list beers', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.listBeers(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(beers, [
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style],
      },
      {
        ...createResult.beers[1],
        breweries: createResult.breweries,
        styles: [createResult.style],
      },
    ])
  })

  test('delete beer breweries', async () => {
    const createResult = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<void> => {
        await beerRepository.deleteBeerBreweries(trx, createResult.beers[0].id)
      },
    )
    const beers = await beerRepository.listBeers(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(beers, [
      {
        ...createResult.beers[1],
        breweries: createResult.breweries,
        styles: [createResult.style],
      },
    ])
  })

  test('delete beer styles', async () => {
    const createResult = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction): Promise<void> => {
        await beerRepository.deleteBeerStyles(trx, createResult.beers[1].id)
      },
    )
    const beers = await beerRepository.listBeers(ctx.db, {
      size: 20,
      skip: 0,
    })
    assertDeepEqual(beers, [
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style],
      },
    ])
  })

  test('search beers', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(ctx.db, {
      name: createResult.beers[0].name.substring(2, 6),
    })
    assertDeepEqual(beers, [
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style],
      },
    ])
  })

  test('search beers ignoring case', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(ctx.db, { name: 'sEVERIN' })
    assertDeepEqual(
      beers.map((beer) => beer.id),
      [createResult.beers[0].id],
    )
  })

  test('search beers by an exact name', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(ctx.db, {
      name: '"severin extra ipa"',
    })
    assertDeepEqual(
      beers.map((beer) => beer.id),
      [createResult.beers[0].id],
    )
  })

  test('not find a beer by part of an exact name', async () => {
    await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(ctx.db, {
      name: '"severin extra"',
    })
    assertDeepEqual(beers, [])
  })

  test('list a page of beers by name', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.listBeers(ctx.db, { size: 1, skip: 1 })
    assertDeepEqual(
      beers.map((beer) => beer.name),
      [createResult.beers[1].name],
    )
  })

  interface CreamAle {
    beer: Beer
    breweries: Brewery[]
    styles: Style[]
  }

  // A cream ale by two breweries, both an ale and a lager, linked in reverse
  // order of the names. The breweries and styles are returned by name.
  async function insertCreamAle(db: Database): Promise<CreamAle> {
    return await db.executeReadWriteTransaction(async (trx: Transaction) => {
      const [beer, sierraNevada, brewdog, lager, ale] = await Promise.all([
        beerRepository.insertBeer(trx, buildNewBeer({ name: 'Cream Ale' })),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Sierra Nevada' }),
        ),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Brewdog' }),
        ),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Ale' })),
      ])
      await Promise.all([
        beerRepository.insertBeerBreweries(trx, [
          { beer: beer.id, brewery: sierraNevada.id },
          { beer: beer.id, brewery: brewdog.id },
        ]),
        beerRepository.insertBeerStyles(trx, [
          { beer: beer.id, style: lager.id },
          { beer: beer.id, style: ale.id },
        ]),
      ])
      return {
        beer,
        breweries: [brewdog, sierraNevada].map(({ id, name }) => ({
          id,
          name,
        })),
        styles: [ale, lager],
      }
    })
  }

  test('find beer with its breweries and styles by name', async () => {
    const { beer, breweries, styles } = await insertCreamAle(ctx.db)
    const found = await beerRepository.findBeerById(ctx.db, beer.id)
    assertDeepEqual(found, { ...beer, breweries, styles })
  })

  test('list beers with their breweries and styles by name', async () => {
    const { beer, breweries, styles } = await insertCreamAle(ctx.db)
    const beers = await beerRepository.listBeers(ctx.db, { size: 20, skip: 0 })
    assertDeepEqual(beers, [{ ...beer, breweries, styles }])
  })

  test('search beers with their breweries and styles by name', async () => {
    const { beer, breweries, styles } = await insertCreamAle(ctx.db)
    const beers = await beerRepository.searchBeers(ctx.db, { name: 'Cream' })
    assertDeepEqual(beers, [{ ...beer, breweries, styles }])
  })
  test('list beers by name', async () => {
    const [weizenbock, karhu, helles] = await insertBeers([
      'Weizenbock',
      'Karhu',
      'Helles',
    ])
    const beers = await beerRepository.listBeers(ctx.db, { size: 20, skip: 0 })
    assertDeepEqual(beers, [helles, karhu, weizenbock])
  })

  test('list beers of the same name by id', async () => {
    const ipas = await insertBeers(['IPA', 'IPA', 'IPA'])
    const beers = await beerRepository.listBeers(ctx.db, { size: 20, skip: 0 })
    assertDeepEqual(beers, ipas.toSorted(byId))
  })

  test('page beers of the same name by id', async () => {
    const ipas = (await insertBeers(['IPA', 'IPA', 'IPA'])).toSorted(byId)
    const pages = [
      await beerRepository.listBeers(ctx.db, { size: 1, skip: 0 }),
      await beerRepository.listBeers(ctx.db, { size: 1, skip: 1 }),
      await beerRepository.listBeers(ctx.db, { size: 1, skip: 2 }),
    ]
    assertDeepEqual(pages, [[ipas[0]], [ipas[1]], [ipas[2]]])
  })

  test('list a page of beers counting a beer once whatever its breweries and styles', async () => {
    const { beer, breweries, styles } = await insertCreamAle(ctx.db)
    const [karhu] = await insertBeers(['Karhu'])
    const pages = [
      await beerRepository.listBeers(ctx.db, { size: 1, skip: 0 }),
      await beerRepository.listBeers(ctx.db, { size: 1, skip: 1 }),
    ]
    assertDeepEqual(pages, [[{ ...beer, breweries, styles }], [karhu]])
  })

  test('search beers by name', async () => {
    const [weizenbock, , pilsner] = await insertBeers([
      'Weizenbock',
      'Karhu',
      'Pilsner Urquell',
    ])
    const beers = await beerRepository.searchBeers(ctx.db, { name: 'e' })
    assertDeepEqual(beers, [pilsner, weizenbock])
  })

  test('search beers of the same name by id', async () => {
    const ipas = await insertBeers(['IPA', 'IPA', 'IPA'])
    const beers = await beerRepository.searchBeers(ctx.db, { name: 'ipa' })
    assertDeepEqual(beers, ipas.toSorted(byId))
  })

  test('search the beers of the first names up to the maximum', async () => {
    const names = Array.from(
      { length: defaultSearchMaxResults + 1 },
      (_: unknown, index: number) => `Lager ${String(index).padStart(2, '0')}`,
    )
    await insertBeers(names.toReversed())
    const beers = await beerRepository.searchBeers(ctx.db, { name: 'lager' })
    assertDeepEqual(
      beers.map((beer: BeerWithBreweriesAndStyles) => beer.name),
      names.slice(0, defaultSearchMaxResults),
    )
  })

  function byId(
    a: BeerWithBreweriesAndStyles,
    b: BeerWithBreweriesAndStyles,
  ): number {
    return a.id < b.id ? -1 : 1
  }

  // Pale lagers by Koskipanimo, as the list and search return them.
  async function insertBeers(
    names: string[],
  ): Promise<BeerWithBreweriesAndStyles[]> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [brewery, style] = await Promise.all([
          breweryRepository.insertBrewery(
            trx,
            buildNewBrewery({ name: 'Koskipanimo' }),
          ),
          styleRepository.insertStyle(
            trx,
            buildNewStyle({ name: 'Pale Lager' }),
          ),
        ])
        const beers = await Promise.all(
          names.map(
            async (name: string) =>
              await beerRepository.insertBeer(trx, buildNewBeer({ name })),
          ),
        )
        await Promise.all([
          beerRepository.insertBeerBreweries(
            trx,
            beers.map((beer: Beer) => ({ beer: beer.id, brewery: brewery.id })),
          ),
          beerRepository.insertBeerStyles(
            trx,
            beers.map((beer: Beer) => ({ beer: beer.id, style: style.id })),
          ),
        ])
        return beers.map((beer: Beer) => ({
          ...beer,
          breweries: [{ id: brewery.id, name: brewery.name }],
          styles: [style],
        }))
      },
    )
  }
})
