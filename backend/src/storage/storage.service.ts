import * as storageRepository from './storage.repository'

import { type Database, type Transaction } from '../database'
import {
  type CreateStorageRequest,
  type UpdateStorageRequest,
  type JoinedStorage,
  type Storage
} from './storage'
import {
  type DbJoinedStorage,
  type StorageRow
} from './storage.table'

import { type Pagination } from '../util/pagination'

export async function createStorage (
  trx: Transaction,
  request: CreateStorageRequest
): Promise<Storage> {
  const storage = await storageRepository.insertStorage(trx, {
    beer: request.beer,
    best_before: new Date(request.bestBefore),
    container: request.container
  })

  return {
    ...storageRowToStorage(storage)
  }
}

export async function updateStorage (
  trx: Transaction,
  storageId: string,
  request: UpdateStorageRequest
): Promise<Storage> {
  const storage = await storageRepository.updateStorage(trx, storageId, {
    beer: request.beer,
    best_before: new Date(request.bestBefore),
    container: request.container
  })

  return {
    ...storageRowToStorage(storage)
  }
}

export async function findStorageById (
  db: Database,
  storageId: string
): Promise<Storage | undefined> {
  const storage = await storageRepository.findStorageById(db, storageId)

  if (storage === null || storage === undefined) return undefined

  return storageRowToStorage(storage)
}

export async function lockStorageById (
  trx: Transaction,
  id: string
): Promise<Storage | undefined> {
  const storageRow = await storageRepository.lockStorageById(trx, id)

  if (storageRow != null) {
    return storageRowToStorage(storageRow)
  }
}

export async function listStorages (
  db: Database,
  pagination: Pagination
): Promise<JoinedStorage[]> {
  const storageRows = await storageRepository.listStorages(db, pagination)
  return toJoinedStorages(storageRows)
}

export async function listStoragesByBeer (
  db: Database,
  beerId: string
): Promise<JoinedStorage[]> {
  const storageRows = await storageRepository.listStoragesByBeer(db, beerId)
  return toJoinedStorages(storageRows)
}

export async function listStoragesByBrewery (
  db: Database,
  breweryId: string
): Promise<JoinedStorage[]> {
  const storageRows =
    await storageRepository.listStoragesByBrewery(db, breweryId)
  return toJoinedStorages(storageRows)
}

function toJoinedStorages (storageRows: DbJoinedStorage[]): JoinedStorage[] {
  return storageRows.map(row => ({
    id: row.storage_id,
    beerId: row.beer_id,
    beerName: row.beer_name,
    bestBefore: row.best_before,
    breweries: row.breweries.map(brewery => ({
      id: brewery.brewery_id,
      name: brewery.name
    })),
    container: {
      id: row.container_id,
      size: row.container_size,
      type: row.container_type
    },
    styles: row.styles.map(style => ({
      id: style.style_id,
      name: style.name
    }))
  }))
}

export function storageRowToStorage (storage: StorageRow): Storage {
  return {
    id: storage.storage_id,
    beer: storage.beer,
    bestBefore: storage.best_before,
    container: storage.container
  }
}
