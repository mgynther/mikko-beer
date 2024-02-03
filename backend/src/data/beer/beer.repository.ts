import { sql } from 'kysely'

import { type Database, type Transaction } from '../database'
import {
  type BeerRow,
  type BeerBreweryRow,
  type BeerStyleRow,
  type BeerTable,
  type InsertableBeerRow,
  type InsertableBeerBreweryRow,
  type InsertableBeerStyleRow,
  type UpdateableBeerRow
} from './beer.table'
import {
  type BeerWithBreweriesAndStyles
} from '../../core/beer/beer'

import { type Pagination, toRowNumbers } from '../../core/pagination'
import {
  type SearchByName,
  defaultSearchMaxResults,
  toIlike
} from '../../core/search'

import { type Brewery } from '../../core/brewery/brewery'
import { type Style } from '../../core/style/style'

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

interface JoinedBeerRow {
  beer_id: string
  name: string | null
  created_at: Date
  brewery_id: string
  brewery_name: string | null
  style_id: string
  style_name: string | null
}

interface BeerTableRn extends BeerTable {
  rn: number
}

const listByNameAsc = sql<BeerTableRn>`(
  SELECT
    beer.*,
    ROW_NUMBER() OVER(ORDER BY beer.name ASC) rn
  FROM beer
  )`

type BeerListPossibleColumns = 'beer.beer_id' |
'beer.name' |
'beer.created_at' |
'brewery.brewery_id as brewery_id' |
'brewery.name as brewery_name' |
'style.style_id as style_id' |
'style.name as style_name'

const beerListColumns: BeerListPossibleColumns[] = [
  'beer.beer_id',
  'beer.name',
  'beer.created_at',
  'brewery.brewery_id as brewery_id',
  'brewery.name as brewery_name',
  'style.style_id as style_id',
  'style.name as style_name'
]

// Kysely types are complicated and it's easier to rely on the implicit type
// here.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getSelectListQuery (db: Database, fromQuery: typeof listByNameAsc) {
  return db.getDb()
    .selectFrom(fromQuery.as('beer'))
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')
    .select(beerListColumns)
}

export async function listBeers (
  db: Database,
  pagination: Pagination
): Promise<BeerWithBreweriesAndStyles[]> {
  const { start, end } = toRowNumbers(pagination)
  const beers = await getSelectListQuery(db, listByNameAsc)
    .where((eb) => eb.between('rn', start, end))
    .orderBy('beer.name', 'asc')
    .execute()

  return toBeersWithBreweriesAndStyles(beers)
}

function toBeersWithBreweriesAndStyles (
  beers: JoinedBeerRow[]
): BeerWithBreweriesAndStyles[] {
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

export async function searchBeers (
  db: Database,
  searchRequest: SearchByName
): Promise<BeerWithBreweriesAndStyles[]> {
  const nameIlike = toIlike(searchRequest)
  const beerNameLike = sql<BeerTableRn>`(
    SELECT beer.*, DENSE_RANK() OVER(ORDER BY name) rn
          FROM beer
          WHERE beer.name ILIKE ${nameIlike}
    )`

  const beers = await getSelectListQuery(db, beerNameLike)
    .where((eb) => eb.between('rn', 1, defaultSearchMaxResults))
    .orderBy('beer.name', 'asc')
    .execute()

  return toBeersWithBreweriesAndStyles(beers)
}
