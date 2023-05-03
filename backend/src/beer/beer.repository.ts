import { sql } from 'kysely'

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
  type BeerWithBreweriesAndStyles
} from './beer'

import { type Pagination, toRowNumbers } from '../util/pagination'

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
  db: Database,
  pagination: Pagination
): Promise<BeerWithBreweriesAndStyles[]> {
  const { start, end } = toRowNumbers(pagination)
  // Did not find a Kysely way to do a window function subquery and use between
  // comparison, so raw SQL it is. Kysely would be better because of sanity
  // checking and typing would not have to be done manually.
  const beerQuery = sql`SELECT
    beer.beer_id, beer.name, beer.created_at,
    brewery.brewery_id as brewery_id, brewery.name as brewery_name,
    style.style_id as style_id, style.name as style_name
  FROM (SELECT beer.*, ROW_NUMBER() OVER(ORDER BY name) rn FROM beer) beer
  INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
  INNER JOIN brewery ON brewery.brewery_id = beer_brewery.brewery
  INNER JOIN beer_style ON beer.beer_id = beer_style.beer
  INNER JOIN style ON style.style_id = beer_style.style
  WHERE beer.rn BETWEEN ${start} AND ${end}
  ORDER BY beer.name ASC
  `
  const beers = (await beerQuery
    .execute(db.getDb()) as {
    rows: Array<{
      beer_id: string
      name: string
      created_at: Date
      brewery_id: string
      brewery_name: string
      style_id: string
      style_name: string
    }>
  }).rows

  if (beers.length === 0) {
    return []
  }

  const beerMap: Record<string, BeerWithBreweriesAndStyles> = {}
  const beerArray: BeerWithBreweriesAndStyles[] = []

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
    if (!beerMap[beer.beer_id].breweries
      .some((brewery) => brewery.id === beer.brewery_id)) {
      beerMap[beer.beer_id].breweries.push({
        id: beer.brewery_id,
        name: beer.brewery_name
      })
    }
    if (!beerMap[beer.beer_id].styles
      .some((style) => style.id === beer.style_id)) {
      beerMap[beer.beer_id].styles.push({
        id: beer.style_id,
        name: beer.style_name
      })
    }
  })

  return beerArray
}
