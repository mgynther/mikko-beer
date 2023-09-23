import { type SelectQueryBuilder, sql } from 'kysely'

import {
  type Database,
  type KyselyDatabase,
  type Transaction
} from '../database'
import {
  type DbJoinedStorage,
  type StorageRow,
  type InsertableStorageRow,
  type UpdateableStorageRow
} from './storage.table'

import { type Pagination, toRowNumbers } from '../util/pagination'

export async function insertStorage (
  trx: Transaction,
  storage: InsertableStorageRow
): Promise<StorageRow> {
  const insertedStorage = await trx.trx()
    .insertInto('storage')
    .values(storage)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedStorage
}

export async function updateStorage (
  trx: Transaction,
  id: string,
  storage: UpdateableStorageRow
): Promise<StorageRow> {
  const updatedStorage = await trx.trx()
    .updateTable('storage')
    .set({
      best_before: storage.best_before,
      beer: storage.beer,
      container: storage.container
    })
    .where('storage_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedStorage
}

export async function findStorageById (
  db: Database,
  id: string
): Promise<DbJoinedStorage | undefined> {
  const storageRows = await db.getDb()
    .selectFrom('storage')
    .innerJoin('beer', 'storage.beer', 'beer.beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')
    .innerJoin('container', 'storage.container', 'container.container_id')
    .where('storage_id', '=', id)
    .select([
      'storage_id',
      'storage.created_at as created_at',
      'best_before',
      'beer.beer_id as beer_id',
      'beer.name as beer_name',
      'brewery.brewery_id as brewery_id',
      'brewery.name as brewery_name',
      'container.container_id as container_id',
      'container.size as container_size',
      'container.type as container_type',
      'style.style_id as style_id',
      'style.name as style_name'
    ])
    .execute()

  if (storageRows === undefined || storageRows.length === 0) {
    return undefined
  }

  const parsed = parseBreweryStorageRows(storageRows)
  return parsed?.[0]
}

export async function deleteStorageById (
  trx: Transaction,
  id: string
): Promise<void> {
  await trx.trx()
    .deleteFrom('storage')
    .where('storage_id', '=', id)
    .execute()
}

export async function lockStorageById (
  trx: Transaction,
  id: string
): Promise<StorageRow | undefined> {
  return await lockStorage(trx, 'storage_id', id)
}

async function lockStorage (
  trx: Transaction,
  column: 'storage_id',
  value: string
): Promise<StorageRow | undefined> {
  const storage = await trx.trx()
    .selectFrom('storage')
    .where(column, '=', value)
    .selectAll('storage')
    .forUpdate()
    .executeTakeFirst()

  return storage
}

export async function listStorages (
  db: Database,
  pagination: Pagination
): Promise<DbJoinedStorage[]> {
  const { start, end } = toRowNumbers(pagination)
  // Did not find a Kysely way to do a window function subquery and use between
  // comparison, so raw SQL it is. Kysely would be better because of sanity
  // checking and typing would not have to be done manually.
  const storageQuery = sql`SELECT
    storage.storage_id, storage.best_before,
    storage.created_at,
    beer.beer_id as beer_id, beer.name as beer_name,
    brewery.brewery_id as brewery_id, brewery.name as brewery_name,
    style.style_id as style_id, style.name as style_name,
    container.container_id as container_id, container.type as container_type,
    container.size as container_size
  FROM (
    SELECT storage.*, ROW_NUMBER() OVER(ORDER BY best_before DESC) rn
    FROM storage) storage
  INNER JOIN beer ON storage.beer = beer.beer_id
  INNER JOIN beer_brewery ON beer.beer_id = beer_brewery.beer
  INNER JOIN brewery ON brewery.brewery_id = beer_brewery.brewery
  INNER JOIN beer_style ON beer.beer_id = beer_style.beer
  INNER JOIN style ON style.style_id = beer_style.style
  INNER JOIN container ON storage.container = container.container_id
  WHERE storage.rn BETWEEN ${start} AND ${end}
  ORDER BY storage.best_before ASC, beer.name ASC
  `

  const storages = (await storageQuery
    .execute(db.getDb()) as {
    rows: JoinedStorage[]
  }).rows

  if (storages.length === 0) {
    return []
  }

  return parseBreweryStorageRows(storages)
}

export async function listStoragesByBeer (
  db: Database,
  beerId: string
): Promise<DbJoinedStorage[]> {
  return await joinStorageData(db.getDb()
    .selectFrom('beer')
    .where('beer.beer_id', '=', beerId)
  )
}

export async function listStoragesByBrewery (
  db: Database,
  breweryId: string
): Promise<DbJoinedStorage[]> {
  return await joinStorageData(db.getDb()
    .selectFrom('beer_brewery as querybrewery')
    .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
    .where('querybrewery.brewery', '=', breweryId)
  )
}

export async function joinStorageData (
  query: SelectQueryBuilder<KyselyDatabase, 'beer', unknown>
): Promise<DbJoinedStorage[]> {
  const storages = await query
    .innerJoin('storage', 'beer.beer_id', 'storage.beer')
    .innerJoin('beer_brewery', 'beer_brewery.beer', 'beer.beer_id')
    .innerJoin('brewery', 'brewery.brewery_id', 'beer_brewery.brewery')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('container', 'container.container_id', 'storage.container')
    .innerJoin('style', 'style.style_id', 'beer_style.style')
    .select([
      'storage.storage_id',
      'storage.best_before',
      'beer.beer_id as beer_id',
      'beer.name as beer_name',
      'brewery.brewery_id as brewery_id',
      'brewery.name as brewery_name',
      'container.container_id as container_id',
      'container.size as container_size',
      'container.type as container_type',
      'storage.created_at as created_at',
      'style.style_id as style_id',
      'style.name as style_name'
    ])
    .orderBy('storage.best_before', 'asc')
    .orderBy('beer_name')
    .execute()

  if (storages.length === 0) {
    return []
  }
  return parseBreweryStorageRows(storages)
}

interface JoinedStorage {
  storage_id: string
  best_before: Date
  beer_id: string
  beer_name: string | null
  brewery_id: string
  brewery_name: string | null
  container_id: string
  container_size: string | null
  container_type: string | null
  created_at: Date
  style_id: string
  style_name: string | null
}

function parseBreweryStorageRows (
  storages: JoinedStorage[]
): DbJoinedStorage[] {
  const storageMap: Record<string, DbJoinedStorage> = {}
  const storageArray: DbJoinedStorage[] = []

  storages.forEach(storage => {
    if (storageMap[storage.storage_id] === undefined) {
      storageMap[storage.storage_id] = {
        ...storage,
        breweries: [{
          brewery_id: storage.brewery_id,
          name: storage.brewery_name
        }],
        styles: [{
          style_id: storage.style_id,
          name: storage.style_name
        }]
      }
      storageArray.push(storageMap[storage.storage_id])
    } else {
      const existing = storageMap[storage.storage_id]
      if (existing.breweries.find(
        brewery => brewery.brewery_id === storage.brewery_id) === undefined) {
        existing.breweries.push({
          brewery_id: storage.brewery_id,
          name: storage.brewery_name
        })
      }
      if (existing.styles.find(
        styles => styles.style_id === storage.style_id) === undefined) {
        existing.styles.push({
          style_id: storage.style_id,
          name: storage.style_name
        })
      }
    }
  })

  storageArray.forEach(storage => {
    storage.breweries.sort((a, b) => a.name?.localeCompare(b?.name ?? '') ?? 0)
    storage.styles.sort((a, b) => a.name?.localeCompare(b?.name ?? '') ?? 0)
  })

  return storageArray
}
