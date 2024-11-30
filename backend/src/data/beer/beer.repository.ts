import { sql } from 'kysely'

import type { Database, Transaction } from '../database'
import type {
  BeerBreweryRow,
  BeerStyleRow,
  BeerTable,
  InsertableBeerBreweryRow,
  InsertableBeerStyleRow
} from './beer.table'
import type {
  BeerWithBreweriesAndStyles,
  Beer,
  NewBeer
} from '../../core/beer/beer'

import { type Pagination, toRowNumbers } from '../../core/pagination'
import {
  type SearchByName,
  defaultSearchMaxResults,
  toIlike
} from '../../core/search'

import type { Brewery } from '../../core/brewery/brewery'
import type { Style } from '../../core/style/style'
import { contains } from '../../core/record'

export async function insertBeer (
  trx: Transaction,
  beer: NewBeer
): Promise<Beer> {
  const insertedBeer = await trx.trx()
    .insertInto('beer')
    .values(beer)
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    id: insertedBeer.beer_id,
    name: insertedBeer.name ?? ''
  }
}

export async function insertBeerBreweries (
  trx: Transaction,
  beerBreweries: InsertableBeerBreweryRow[]
): Promise<BeerBreweryRow> {
  const insertedBeerBreweries = await trx.trx()
    .insertInto('beer_brewery')
    .values(beerBreweries)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerBreweries
}

export async function insertBeerStyles (
  trx: Transaction,
  beerStyles: InsertableBeerStyleRow[]
): Promise<BeerStyleRow> {
  const insertedBeerStyles = await trx.trx()
    .insertInto('beer_style')
    .values(beerStyles)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBeerStyles
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
  beer: Beer
): Promise<Beer> {
  const updatedBeer = await trx.trx()
    .updateTable('beer')
    .set({
      name: beer.name
    })
    .where('beer_id', '=', beer.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    id: updatedBeer.beer_id,
    name: updatedBeer.name ?? ''
  }
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

  if (beerRows.length === 0) {
    return undefined
  }

  const {beer_id, name} = beerRows[0]

  const breweryIds: Record<string, boolean> = {}
  const styleIds: Record<string, boolean> = {}

  const breweries: Brewery[] = []
  const styles: Style[] = []

  beerRows.forEach(row => {
    if (!breweryIds[row.brewery_id]) {
      breweryIds[row.brewery_id] = true
      breweries.push({ id: row.brewery_id, name: row.brewery_name ?? '' })
    }
    if (!styleIds[row.style_id]) {
      styleIds[row.style_id] = true
      styles.push({ id: row.style_id, name: row.style_name ?? '' })
    }
  })

  return {
    id: beer_id,
    name: name ?? '',
    breweries,
    styles
  }
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

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type --
 * Kysely types are complicated and it's easier to rely on the implicit type
 * here.
 */
function getSelectListQuery (db: Database, fromQuery: typeof listByNameAsc) {
  return db.getDb()
    .selectFrom(fromQuery.as('beer'))
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')
    .select(beerListColumns)
}

export async function lockBeer (
  trx: Transaction,
  key: string
): Promise<string | undefined> {
  const beer = await trx.trx()
    .selectFrom('beer')
    .where('beer_id', '=', key)
    .select('beer_id')
    .forUpdate()
    .executeTakeFirst()

  return beer?.beer_id
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
    if (!contains(beerMap, beer.beer_id)) {
      beerMap[beer.beer_id] = {
        id: beer.beer_id,
        name: beer.name ?? '',
        breweries: [],
        styles: []
      }
      beerArray.push(beerMap[beer.beer_id])
    }
    if (!beerMap[beer.beer_id].breweries
      .some((brewery) => brewery.id === beer.brewery_id)) {
      beerMap[beer.beer_id].breweries.push({
        id: beer.brewery_id,
        name: beer.brewery_name ?? ''
      })
    }
    if (!beerMap[beer.beer_id].styles
      .some((style) => style.id === beer.style_id)) {
      beerMap[beer.beer_id].styles.push({
        id: beer.style_id,
        name: beer.style_name ?? ''
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
