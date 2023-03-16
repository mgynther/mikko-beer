import { type Database, type Transaction } from '../database'
import {
  type BreweryRow,
  type InsertableBreweryRow,
  type UpdateableBreweryRow
} from './brewery.table'

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

export async function lockBreweryById (
  trx: Transaction,
  id: string
): Promise<BreweryRow | undefined> {
  return await lockBrewery(trx, 'brewery_id', id)
}

async function lockBrewery (
  trx: Transaction,
  column: 'brewery_id',
  value: string
): Promise<BreweryRow | undefined> {
  const brewery = await trx.trx()
    .selectFrom('brewery')
    .where(column, '=', value)
    .selectAll('brewery')
    .forUpdate()
    .executeTakeFirst()

  return brewery
}

export async function listBreweries (
  db: Database
): Promise<BreweryRow[] | undefined> {
  const breweries = await db.getDb()
    .selectFrom('brewery')
    .selectAll('brewery')
    .execute()

  if (breweries.length === 0) {
    return undefined
  }

  return [...breweries]
}
