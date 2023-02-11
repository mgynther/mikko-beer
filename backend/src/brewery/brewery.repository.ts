import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type InsertableBreweryRow, type BreweryRow } from './brewery.table'

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
