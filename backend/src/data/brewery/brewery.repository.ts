import type { Database, Transaction } from '../database'
import type {
  BreweryRow
} from './brewery.table'

import type {
  Brewery,
  NewBrewery
} from '../../core/brewery'
import type {
  Pagination
} from '../../core/pagination'
import type { SearchByName } from '../../core/search'
import { defaultSearchMaxResults, toIlike } from '../../core/search'

export async function insertBrewery (
  trx: Transaction,
  brewery: NewBrewery
): Promise<Brewery> {
  const insertedBrewery = await trx.trx()
    .insertInto('brewery')
    .values(brewery)
    .returningAll()
    .executeTakeFirstOrThrow()

  return rowToBrewery(insertedBrewery)
}

export async function updateBrewery (
  trx: Transaction,
  brewery: Brewery
): Promise<Brewery> {
  const updatedBrewery = await trx.trx()
    .updateTable('brewery')
    .set({
      name: brewery.name
    })
    .where('brewery_id', '=', brewery.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return rowToBrewery(updatedBrewery)
}

export async function findBreweryById (
  db: Database,
  id: string
): Promise<Brewery | undefined> {
  const breweryRow = await db.getDb()
    .selectFrom('brewery')
    .where('brewery_id', '=', id)
    .selectAll('brewery')
    .executeTakeFirst()

  if (breweryRow === undefined) {
    return undefined
  }

  return rowToBrewery(breweryRow)
}

export async function lockBreweries (
  trx: Transaction,
  keys: string[]
): Promise<string[]> {
  const breweries = await trx.trx()
    .selectFrom('brewery')
    .where('brewery_id', 'in', keys)
    .select('brewery_id')
    .forUpdate()
    .execute()

  return breweries.map(brewery => brewery.brewery_id)
}

export async function listBreweries (
  db: Database,
  pagination: Pagination
): Promise<Brewery[]> {
  const breweries = await db.getDb()
    .selectFrom('brewery')
    .selectAll('brewery')
    .orderBy('brewery.name')
    .limit(pagination.size)
    .offset(pagination.skip)
    .execute()

  return breweries.map(rowToBrewery)
}

export async function searchBreweries (
  db: Database,
  searchRequest: SearchByName
): Promise<Brewery[]> {
  const nameIlike = toIlike(searchRequest)
  const breweries = await db.getDb()
    .selectFrom('brewery')
    .selectAll('brewery')
    .where(
      'brewery.name', 'ilike', nameIlike
    )
    .limit(defaultSearchMaxResults)
    .execute()

  return breweries.map(rowToBrewery)
}

function rowToBrewery (row: BreweryRow): Brewery {
  return {
    id: row.brewery_id,
    name: row.name ?? ''
  }
}
