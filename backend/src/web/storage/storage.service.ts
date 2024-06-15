import * as storageRepository from '../../data/storage/storage.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateStorageRequest,
  type JoinedStorage,
  type Storage
} from '../../core/storage/storage'

import { type Pagination } from '../../core/pagination'

export async function createStorage (
  trx: Transaction,
  request: CreateStorageRequest
): Promise<Storage> {
  const storage = await storageRepository.insertStorage(trx, request)

  return {
    ...storage
  }
}

export async function updateStorage (
  trx: Transaction,
  request: Storage
): Promise<Storage> {
  const storage = await storageRepository.updateStorage(trx, request)

  return {
    ...storage
  }
}

export async function findStorageById (
  db: Database,
  storageId: string
): Promise<JoinedStorage | undefined> {
  const storage = await storageRepository.findStorageById(db, storageId)

  if (storage === null || storage === undefined) return undefined

  return storage
}

export async function listStorages (
  db: Database,
  pagination: Pagination
): Promise<JoinedStorage[]> {
  const storages = await storageRepository.listStorages(db, pagination)
  return storages
}

export async function listStoragesByBeer (
  db: Database,
  beerId: string
): Promise<JoinedStorage[]> {
  const storages = await storageRepository.listStoragesByBeer(db, beerId)
  return storages
}

export async function listStoragesByBrewery (
  db: Database,
  breweryId: string
): Promise<JoinedStorage[]> {
  const storages =
    await storageRepository.listStoragesByBrewery(db, breweryId)
  return storages
}

export async function listStoragesByStyle (
  db: Database,
  styleId: string
): Promise<JoinedStorage[]> {
  const storages =
    await storageRepository.listStoragesByStyle(db, styleId)
  return storages
}
