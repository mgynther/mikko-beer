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
    brewery: Brewery,
    style: Style
  }

  async function createBeers(db: Database): Promise<CreateBeersResult> {
    return await db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<CreateBeersResult> => {
      const [severinBeer, smörreBeer, brewery, style] = await Promise.all([
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
          [{ beer: severinBeer.id, brewery: brewery.id }]
        ),
        beerRepository.insertBeerStyles(
          trx,
          [{ beer: severinBeer.id, style: style.id }]
        ),
        beerRepository.insertBeerBreweries(
          trx,
          [{ beer: smörreBeer.id, brewery: brewery.id }]
        ),
        beerRepository.insertBeerStyles(
          trx,
          [{ beer: smörreBeer.id, style: style.id }]
        )
      ])
      return {
        beers: [ severinBeer, smörreBeer ],
        brewery,
        style
      }
    })
  }

  it('find beer by id', async () => {
    const result = await createBeers(ctx.db)
    const readBeer = await beerRepository.findBeerById(
      ctx.db,
      result.beers[0].id
    )
    assertDeepEqual(
      readBeer,
      {
        ...result.beers[0],
        breweries: [result.brewery],
        styles: [result.style]
      }
    )
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
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        beer.id
      )
      assertEqual(lockedKey, beer.id)
    })
  })

  it('do not lock beer that does not exists', async () => {
    const dummyId = '48c92e78-f24b-44bb-901e-02116ca9214e'
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const lockedKey = await beerRepository.lockBeer(
        trx,
        dummyId
      )
      assertEqual(lockedKey, undefined)
    })
  })

  it('list beers', async () => {
    const result = await createBeers(ctx.db)
    const beers = await beerRepository.listBeers(
      ctx.db,
      {
        size: 20,
        skip: 0
      }
    )
    assertDeepEqual(beers, [
      {
        ...result.beers[0],
        breweries: [result.brewery],
        styles: [result.style]
      },
      {
        ...result.beers[1],
        breweries: [result.brewery],
        styles: [result.style]
      }
    ])
  })

  it('delete beer breweries', async () => {
    const result = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<void> => {
      await beerRepository.deleteBeerBreweries(trx, result.beers[0].id)
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
        ...result.beers[1],
        breweries: [result.brewery],
        styles: [result.style]
      }
    ])
  })

  it('delete beer styles', async () => {
    const result = await createBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (
      trx: Transaction
    ): Promise<void> => {
      await beerRepository.deleteBeerStyles(trx, result.beers[1].id)
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
        ...result.beers[0],
        breweries: [result.brewery],
        styles: [result.style]
      }
    ])
  })

  it('search beers', async () => {
    const result = await createBeers(ctx.db)
    const beers = await beerRepository.searchBeers(
      ctx.db,
      { name: result.beers[0].name.substring(2, 6) }
    )
    assertDeepEqual(beers, [{
      ...result.beers[0],
      breweries: [result.brewery],
      styles: [result.style]
    }])
  })
})
