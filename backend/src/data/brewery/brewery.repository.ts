import { type Database, type Transaction } from '../database'
import {
  type BreweryRow,
  type InsertableBreweryRow,
  type UpdateableBreweryRow
} from './brewery.table'

import {
  type Pagination
} from '../../core/pagination'
import {
  type SearchByName,
  defaultSearchMaxResults,
  toIlike
} from '../../core/search'

export async function insertBrewery (
  trx: Transaction,
  brewery: InsertableBreweryRow
): Promise<BreweryRow> {
  const insertedBrewery = await trx.trx()
    .insertInto('brewery')
    .values(brewery)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBrewery
}

export async function updateBrewery (
  trx: Transaction,
  id: string,
  brewery: UpdateableBreweryRow
): Promise<BreweryRow> {
  const updatedBrewery = await trx.trx()
    .updateTable('brewery')
    .set({
      name: brewery.name
    })
    .where('brewery_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedBrewery
}

export async function findBreweryById (
  db: Database,
  id: string
): Promise<BreweryRow | undefined> {
  const brewery = await db.getDb()
    .selectFrom('brewery')
    .where('brewery_id', '=', id)
    .selectAll('brewery')
    .executeTakeFirst()

  return brewery
}

export async function listBreweries (
  db: Database,
  pagination: Pagination
): Promise<BreweryRow[] | undefined> {
  const breweries = await db.getDb()
    .selectFrom('brewery')
    .selectAll('brewery')
    .orderBy('brewery.name')
    .limit(pagination.size)
    .offset(pagination.skip)
    .execute()

  if (breweries.length === 0) {
    return undefined
  }

  return [...breweries]
}

export async function searchBreweries (
  db: Database,
  searchRequest: SearchByName
): Promise<BreweryRow[] | undefined> {
  const nameIlike = toIlike(searchRequest)
  const breweries = await db.getDb()
    .selectFrom('brewery')
    .selectAll('brewery')
    .where(
      'brewery.name', 'ilike', nameIlike
    )
    .limit(defaultSearchMaxResults)
    .execute()

  if (breweries.length === 0) {
    return undefined
  }

  return [...breweries]
}
