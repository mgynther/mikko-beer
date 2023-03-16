import { type Database, type Transaction } from '../database'
import {
  type BeerRow,
  type BeerBreweryRow,
  type BeerStyleRow,
  type InsertableBeerRow,
  type InsertableBeerBreweryRow,
  type InsertableBeerStyleRow,
  type UpdateableBeerRow
} from './beer.table'
import {
  type BeerWithBreweriesAndStyles,
  type BeerWithBreweryAndStyleIds
} from './beer'

import { type Brewery } from '../brewery/brewery'
import { type Style } from '../style/style'

export async function insertBeer (
  trx: Transaction,
  beer: InsertableBeerRow
): Promise<BeerRow> {
  const insertedBeer = await trx.trx()
    .insertInto('beer')
    .values(beer)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeer
}

export async function insertBeerBrewery (
  trx: Transaction,
  beerBrewery: InsertableBeerBreweryRow
): Promise<BeerBreweryRow> {
  const insertedBeerBrewery = await trx.trx()
    .insertInto('beer_brewery')
    .values(beerBrewery)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerBrewery
}

export async function insertBeerStyle (
  trx: Transaction,
  beerStyle: InsertableBeerStyleRow
): Promise<BeerStyleRow> {
  const insertedBeerStyle = await trx.trx()
    .insertInto('beer_style')
    .values(beerStyle)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerStyle
}

export async function deleteBeerBreweries (
  trx: Transaction,
  beerId: string
): Promise<void> {
  await trx.trx()
    .deleteFrom('beer_brewery')
    .where('beer_brewery.beer', '=', beerId)
    .execute()
}

export async function deleteBeerStyles (
  trx: Transaction,
  beerId: string
): Promise<void> {
  await trx.trx()
    .deleteFrom('beer_style')
    .where('beer_style.beer', '=', beerId)
    .execute()
}

export async function updateBeer (
  trx: Transaction,
  id: string,
  beer: UpdateableBeerRow
): Promise<BeerRow> {
  const updatedBeer = await trx.trx()
    .updateTable('beer')
    .set({
      name: beer.name
    })
    .where('beer_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedBeer
}

export async function findBeerById (
  db: Database,
  id: string
): Promise<BeerWithBreweriesAndStyles | undefined> {
  const beerRows = await db.getDb()
    .selectFrom('beer')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .where('beer_id', '=', id)
    .select([
      'beer.beer_id',
      'beer.name',
      'beer.created_at',
      'brewery.brewery_id as brewery_id',
      'brewery.name as brewery_name',
      'style.style_id as style_id',
      'style.name as style_name'
    ])
    .execute()

  if (beerRows === undefined || beerRows.length === 0) {
    return undefined
  }

  const beer_id = beerRows[0].beer_id
  const name = beerRows[0].name

  const breweryIds: Record<string, boolean> = {}
  const styleIds: Record<string, boolean> = {}

  const breweries: Brewery[] = []
  const styles: Style[] = []

  beerRows.forEach(row => {
    if (!breweryIds[row.brewery_id]) {
      breweryIds[row.brewery_id] = true
      breweries.push({ id: row.brewery_id, name: row.brewery_name })
    }
    if (!styleIds[row.style_id]) {
      styleIds[row.style_id] = true
      styles.push({ id: row.style_id, name: row.style_name })
    }
  })

  return {
    id: beer_id,
    name,
    breweries,
    styles
  }
}

export async function lockBeerById (
  trx: Transaction,
  id: string
): Promise<BeerRow | undefined> {
  return await lockBeer(trx, 'beer_id', id)
}

async function lockBeer (
  trx: Transaction,
  column: 'beer_id',
  value: string
): Promise<BeerRow | undefined> {
  const beer = await trx.trx()
    .selectFrom('beer')
    .where(column, '=', value)
    .selectAll('beer')
    .forUpdate()
    .executeTakeFirst()

  return beer
}

export async function listBeers (
  db: Database
): Promise<BeerWithBreweryAndStyleIds[] | undefined> {
  const beers = await db.getDb()
    .selectFrom('beer')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .select([
      'beer.beer_id',
      'beer.name',
      'beer.created_at',
      'beer_brewery.brewery as brewery',
      'beer_style.style as style'
    ])
    .execute()

  if (beers.length === 0) {
    return undefined
  }

  const beerMap: Record<string, BeerWithBreweryAndStyleIds> = {}
  const beerArray: BeerWithBreweryAndStyleIds[] = []

  beers.forEach(beer => {
    if (beerMap[beer.beer_id] === undefined) {
      beerMap[beer.beer_id] = {
        id: beer.beer_id,
        name: beer.name,
        breweries: [],
        styles: []
      }
      beerArray.push(beerMap[beer.beer_id])
    }
    if (!beerMap[beer.beer_id].breweries.includes(beer.brewery)) {
      beerMap[beer.beer_id].breweries.push(beer.brewery)
    }
    if (!beerMap[beer.beer_id].styles.includes(beer.style)) {
      beerMap[beer.beer_id].styles.push(beer.style)
    }
  })

  return beerArray
}
