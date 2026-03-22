import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { Beer } from '../../../src/core/beer/beer'
import type { Brewery } from '../../../src/core/brewery/brewery'
import type { Style } from '../../../src/core/style/style'
import type { Database, Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository
from '../../../src/data/brewery/brewery.repository'
import * as styleRepository from '../../../src/data/style/style.repository'
import { assertDeepEqual, assertEqual } from '../../assert'

describe('beer tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  interface CreateBeersResult {
    beers: Beer[],
    breweries: Brewery[],
    style: Style
  }

  async function createBeers(db: Database): Promise<CreateBeersResult> {
    return await db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<CreateBeersResult> => {
      const [
        severinBeer,
        smörreBeer,
        koskipanimoBrewery,
        fabrikenBrewery,
        style
      ] = await Promise.all([
        beerRepository.insertBeer(
          trx,
          {
            name: 'Severin Extra IPA'
          }
        ),
        beerRepository.insertBeer(
          trx,
          {
            name: 'Smörre Rye IPA'
          }
        ),
        breweryRepository.insertBrewery(
          trx,
          {
            name: 'Koskipanimo'
          }
        ),
        breweryRepository.insertBrewery(
          trx,
          {
            name: 'Ölfabrikenin'
          }
        ),
        styleRepository.insertStyle(
          trx,
          {
            name: 'American IPA'
          }
        ),
      ])
      await Promise.all([
        beerRepository.insertBeerBreweries(
          trx,
          [{ beer: severinBeer.id, brewery: koskipanimoBrewery.id }]
        ),
        beerRepository.insertBeerStyles(
          trx,
          [{ beer: severinBeer.id, style: style.id }]
        ),
        beerRepository.insertBeerBreweries(
          trx,
          [
            { beer: smörreBeer.id, brewery: koskipanimoBrewery.id },
            { beer: smörreBeer.id, brewery: fabrikenBrewery.id },
          ]
        ),
        beerRepository.insertBeerStyles(
          trx,
          [{ beer: smörreBeer.id, style: style.id }]
        )
      ])
      return {
        beers: [ severinBeer, smörreBeer ],
        breweries: [koskipanimoBrewery, fabrikenBrewery],
        style
      }
    })
  }

  it('find beer by id', async () => {
    const createResult = await createBeers(ctx.db)
    const readBeer = await beerRepository.findBeerById(
      ctx.db,
      createResult.beers[0].id
    )
    assertDeepEqual(
      readBeer,
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style]
      }
    )
  })

  it('find beer that does not exist', async () => {
    const readBeer = await beerRepository.findBeerById(
      ctx.db,
      'fda99507-46d0-4f6f-a3fe-85cffecd8762'
    )
    assertDeepEqual(readBeer, undefined)
  })

  it('update beer', async () => {
    const beer = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await beerRepository.insertBeer(
        trx,
        { name: 'Viikingi Kajre' }
      )
    })
    const updated = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await beerRepository.updateBeer(
        trx,
        {
          ...beer,
          name: 'Viikingi Karje'
        }
      )
    })
    assertDeepEqual(updated, {
      ...beer,
      name: 'Viikingi Karje'
    })
  })

  it('lock beer that exists', async () => {
    const beer = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await beerRepository.insertBeer(trx, { name: 'Weizenbock' })
    })
    const lockedKey = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        beer.id
      )
      return lockedKey
    })
    assertEqual(lockedKey, beer.id)
  })

  it('do not lock beer that does not exists', async () => {
    const dummyId = '48c92e78-f24b-44bb-901e-02116ca9214e'
    const lockedKey = await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ) => {
      return await beerRepository.lockBeer(
        trx,
        dummyId
      )
    })
    assertEqual(lockedKey, undefined)
  })

  it('empty beer list', async () => {
    const beers = await beerRepository.listBeers(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(beers, [])
  })

  it('list beers', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.listBeers(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(beers, [
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style]
      },
      {
        ...createResult.beers[1],
        breweries: createResult.breweries,
        styles: [createResult.style]
      }
    ])
  })

  it('delete beer breweries', async () => {
    const createResult = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<void> => {
      await beerRepository.deleteBeerBreweries(trx, createResult.beers[0].id)
    })
    const beers = await beerRepository.listBeers(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(beers, [
      {
        ...createResult.beers[1],
        breweries: createResult.breweries,
        styles: [createResult.style]
      }
    ])
  })

  it('delete beer styles', async () => {
    const createResult = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<void> => {
      await beerRepository.deleteBeerStyles(trx, createResult.beers[1].id)
    })
    const beers = await beerRepository.listBeers(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(beers, [
      {
        ...createResult.beers[0],
        breweries: [createResult.breweries[0]],
        styles: [createResult.style]
      }
    ])
  })

  it('search beers', async () => {
    const createResult = await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(
      ctx.db,
      { name: createResult.beers[0].name.substring(2, 6) }
    )
    assertDeepEqual(beers, [{
      ...createResult.beers[0],
      breweries: [createResult.breweries[0]],
      styles: [createResult.style]
    }])
  })
})
