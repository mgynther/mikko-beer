import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type BreweryRow, type InsertableBreweryRow, type UpdateableBreweryRow } from './brewery.table'

export async function insertBrewery (
  db: Kysely<Database>,
  brewery: InsertableBreweryRow
): Promise<BreweryRow> {
  const insertedBrewery = await db
    .insertInto('brewery')
    .values(brewery)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedBrewery
}

export async function updateBrewery (
  db: Kysely<Database>,
  id: string,
  brewery: UpdateableBreweryRow
): Promise<BreweryRow> {
  const updatedBrewery = await db
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
  db: Kysely<Database>,
  id: string
): Promise<BreweryRow | undefined> {
  const brewery = await db
    .selectFrom('brewery')
    .where('brewery_id', '=', id)
    .selectAll('brewery')
    .executeTakeFirst()

  return brewery
}

export async function lockBreweryById (
  trx: Transaction<Database>,
  id: string
): Promise<BreweryRow | undefined> {
  return await lockBrewery(trx, 'brewery_id', id)
}

async function lockBrewery (
  trx: Transaction<Database>,
  column: 'brewery_id',
  value: string
): Promise<BreweryRow | undefined> {
  const brewery = await trx
    .selectFrom('brewery')
    .where(column, '=', value)
    .selectAll('brewery')
    .forUpdate()
    .executeTakeFirst()

  return brewery
}

export async function listBreweries (
  db: Kysely<Database>
): Promise<BreweryRow[] | undefined> {
  const breweries = await db
    .selectFrom('brewery')
    .selectAll('brewery')
    .execute()

  if (breweries.length === 0) {
    return undefined
  }

  return [...breweries]
}
