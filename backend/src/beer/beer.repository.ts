import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type BeerRow, type BeerBreweryRow, type BeerStyleRow, type InsertableBeerRow, type InsertableBeerBreweryRow, type InsertableBeerStyleRow, type UpdateableBeerRow } from './beer.table'
import { type BeerWithBreweriesAndStyles } from './beer'

import { type Brewery } from '../brewery/brewery'
import { type Style } from '../style/style'

export async function insertBeer (
  db: Kysely<Database>,
  beer: InsertableBeerRow
): Promise<BeerRow> {
  const insertedBeer = await db
    .insertInto('beer')
    .values(beer)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeer
}

export async function insertBeerBrewery (
  db: Kysely<Database>,
  beerBrewery: InsertableBeerBreweryRow
): Promise<BeerBreweryRow> {
  const insertedBeerBrewery = await db
    .insertInto('beer_brewery')
    .values(beerBrewery)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerBrewery
}

export async function insertBeerStyle (
  db: Kysely<Database>,
  beerStyle: InsertableBeerStyleRow
): Promise<BeerStyleRow> {
  const insertedBeerStyle = await db
    .insertInto('beer_style')
    .values(beerStyle)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerStyle
}

export async function deleteBeerBreweries (
  db: Kysely<Database>,
  beerId: string
): Promise<void> {
  await db
    .deleteFrom('beer_brewery')
    .where('beer_brewery.beer', '=', beerId)
    .execute()
}

export async function deleteBeerStyles (
  db: Kysely<Database>,
  beerId: string
): Promise<void> {
  await db
    .deleteFrom('beer_style')
    .where('beer_style.beer', '=', beerId)
    .execute()
}

export async function updateBeer (
  db: Kysely<Database>,
  id: string,
  beer: UpdateableBeerRow
): Promise<BeerRow> {
  const updatedBeer = await db
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
  db: Kysely<Database>,
  id: string
): Promise<BeerWithBreweriesAndStyles | undefined> {
  const beerRows = await db
    .selectFrom('beer')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .where('beer_id', '=', id)
    .select(['beer.beer_id', 'beer.name', 'beer.created_at', 'brewery.brewery_id as brewery_id', 'brewery.name as brewery_name', 'style.style_id as style_id', 'style.name as style_name'])
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
  trx: Transaction<Database>,
  id: string
): Promise<BeerRow | undefined> {
  return await lockBeer(trx, 'beer_id', id)
}

async function lockBeer (
  trx: Transaction<Database>,
  column: 'beer_id',
  value: string
): Promise<BeerRow | undefined> {
  const beer = await trx
    .selectFrom('beer')
    .where(column, '=', value)
    .selectAll('beer')
    .forUpdate()
    .executeTakeFirst()

  return beer
}

export async function listBeers (
  db: Kysely<Database>
): Promise<BeerRow[] | undefined> {
  const beers = await db
    .selectFrom('beer')
    .selectAll('beer')
    .execute()

  if (beers.length === 0) {
    return undefined
  }

  return [...beers]
}
