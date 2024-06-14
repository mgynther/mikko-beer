import { type SelectQueryBuilder, sql } from 'kysely'

import {
  type Database,
  type KyselyDatabase,
  type Transaction
} from '../database'
import {
  type DbJoinedStorage,
  type StorageRow,
  type StorageTable,
  type InsertableStorageRow,
  type UpdateableStorageRow
} from './storage.table'

import { type Pagination, toRowNumbers } from '../../core/pagination'

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

interface StorageTableRn extends StorageTable {
  rn: number
}

const listByBestBeforeDesc = sql<StorageTableRn>`(
  SELECT
    storage.*,
    ROW_NUMBER() OVER(ORDER BY best_before DESC) rn
  FROM storage
  )`

type PossibleListColumns =
  'storage.storage_id' |
  'storage.best_before' |
  'storage.created_at' |
  'beer.beer_id as beer_id' |
  'beer.name as beer_name' |
  'brewery.brewery_id as brewery_id' |
  'brewery.name as brewery_name' |
  'style.style_id as style_id' |
  'style.name as style_name' |
  'container.container_id as container_id' |
  'container.type as container_type' |
  'container.size as container_size'

const listColumns: PossibleListColumns[] = [
  'storage.storage_id',
  'storage.best_before',
  'storage.created_at',
  'beer.beer_id as beer_id',
  'beer.name as beer_name',
  'brewery.brewery_id as brewery_id',
  'brewery.name as brewery_name',
  'style.style_id as style_id',
  'style.name as style_name',
  'container.container_id as container_id',
  'container.type as container_type',
  'container.size as container_size'
]

export async function listStorages (
  db: Database,
  pagination: Pagination
): Promise<DbJoinedStorage[]> {
  const { start, end } = toRowNumbers(pagination)

  const storages = await db.getDb()
    .selectFrom(listByBestBeforeDesc.as('storage'))
    .innerJoin('beer', 'storage.beer', 'beer.beer_id')
    .innerJoin('beer_brewery', 'beer.beer_id', 'beer_brewery.beer')
    .innerJoin('brewery', 'beer_brewery.brewery', 'brewery.brewery_id')
    .innerJoin('beer_style', 'beer.beer_id', 'beer_style.beer')
    .innerJoin('style', 'beer_style.style', 'style.style_id')
    .innerJoin('container', 'storage.container', 'container.container_id')
    .select(listColumns)
    .where((eb) => eb.between('rn', start, end))
    .orderBy('best_before', 'asc')
    .orderBy('beer_name', 'asc')
    .execute()

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

export async function listStoragesByStyle (
  db: Database,
  styleId: string
): Promise<DbJoinedStorage[]> {
  return await joinStorageData(db.getDb()
    .selectFrom('beer_style as querystyle')
    .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
    .where('querystyle.style', '=', styleId)
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
    .select(listColumns)
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
