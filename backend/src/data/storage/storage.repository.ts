import { type SelectQueryBuilder, sql } from 'kysely'

import type {
  Database,
  KyselyDatabase,
  Transaction
} from '../database'
import type {
  DbJoinedStorage,
  StorageRow,
  StorageTable
} from './storage.table'

import { type Pagination, toRowNumbers } from '../../core/pagination'
import type {
  JoinedStorage,
  Storage,
  StorageRequest,
  StorageWithDate
} from '../../core/storage/storage'
import { contains } from '../../core/record'

export async function insertStorage (
  trx: Transaction,
  storage: StorageRequest
): Promise<StorageWithDate> {
  const insertedStorage = await trx.trx()
    .insertInto('storage')
    .values({
      beer: storage.beer,
      best_before: new Date(storage.bestBefore),
      container: storage.container
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return toStorage(insertedStorage)
}

export async function updateStorage (
  trx: Transaction,
  storage: Storage
): Promise<StorageWithDate> {
  const updatedStorage = await trx.trx()
    .updateTable('storage')
    .set({
      best_before: new Date(storage.bestBefore),
      beer: storage.beer,
      container: storage.container
    })
    .where('storage_id', '=', storage.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return toStorage(updatedStorage)
}

export async function findStorageById (
  db: Database,
  id: string
): Promise<JoinedStorage | undefined> {
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

  if (storageRows.length === 0) {
    return undefined
  }

  const parsed = parseBreweryStorageRows(storageRows)
  return toJoinedStorages(parsed)[0]
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

export async function lockStorage (
  trx: Transaction,
  key: string
): Promise<string | undefined> {
  const storage = await trx.trx()
    .selectFrom('storage')
    .where('storage_id', '=', key)
    .select('storage_id')
    .forUpdate()
    .executeTakeFirst()

  return storage?.storage_id
}

export async function listStorages (
  db: Database,
  pagination: Pagination
): Promise<JoinedStorage[]> {
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

  return toJoinedStorages(parseBreweryStorageRows(storages))
}

export async function listStoragesByBeer (
  db: Database,
  beerId: string
): Promise<JoinedStorage[]> {
  return toJoinedStorages(await joinStorageData(db.getDb()
    .selectFrom('beer')
    .where('beer.beer_id', '=', beerId)
  ))
}

export async function listStoragesByBrewery (
  db: Database,
  breweryId: string
): Promise<JoinedStorage[]> {
  return toJoinedStorages(await joinStorageData(db.getDb()
    .selectFrom('beer_brewery as querybrewery')
    .innerJoin('beer', 'querybrewery.beer', 'beer.beer_id')
    .where('querybrewery.brewery', '=', breweryId)
  ))
}

export async function listStoragesByStyle (
  db: Database,
  styleId: string
): Promise<JoinedStorage[]> {
  return toJoinedStorages(await joinStorageData(db.getDb()
    .selectFrom('beer_style as querystyle')
    .innerJoin('beer', 'querystyle.beer', 'beer.beer_id')
    .where('querystyle.style', '=', styleId)
  ))
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

interface InternalJoinedStorage {
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
  storages: InternalJoinedStorage[]
): DbJoinedStorage[] {
  const storageMap: Record<string, DbJoinedStorage> = {}
  const storageArray: DbJoinedStorage[] = []

  storages.forEach(storage => {
    if (!contains(storageMap, storage.storage_id)) {
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
    storage.breweries.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
    storage.styles.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
  })

  return storageArray
}

export function toStorage (storage: StorageRow): StorageWithDate {
  return {
    id: storage.storage_id,
    beer: storage.beer,
    bestBefore: storage.best_before,
    container: storage.container
  }
}

function toJoinedStorages (storageRows: DbJoinedStorage[]): JoinedStorage[] {
  return storageRows.map(row => ({
    id: row.storage_id,
    beerId: row.beer_id,
    beerName: row.beer_name ?? '',
    bestBefore: row.best_before,
    breweries: row.breweries.map(brewery => ({
      id: brewery.brewery_id,
      name: brewery.name ?? ''
    })),
    container: {
      id: row.container_id,
      size: row.container_size ?? '',
      type: row.container_type ?? ''
    },
    createdAt: row.created_at,
    styles: row.styles.map(style => ({
      id: style.style_id,
      name: style.name ?? ''
    }))
  }))
}
