import {
  type CreateStorageRequest,
  type JoinedStorage,
  type Storage
} from '../../core/storage/storage'

import { INFO, log } from '../log'

import { type Pagination } from '../../core/pagination'

export async function createStorage (
  insert: (request: CreateStorageRequest) => Promise<Storage>,
  request: CreateStorageRequest
): Promise<Storage> {
  log(INFO, 'create storage for beer', request.beer)
  const storage = await insert(request)

  log(INFO, 'created storage for beer', request.beer)
  return {
    ...storage
  }
}

export async function updateStorage (
  update: (request: Storage) => Promise<Storage>,
  request: Storage
): Promise<Storage> {
  log(INFO, 'update storage', request.id)
  const storage = await update(request)

  log(INFO, 'updated storage', request.id)
  return {
    ...storage
  }
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  storageId: string
): Promise<JoinedStorage | undefined> {
  log(INFO, 'find storage', storageId)
  const storage = await findById(storageId)

  if (storage === undefined) return undefined

  return storage
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  pagination: Pagination
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages', pagination)
  return await list(pagination)
}

export async function listStoragesByBeer (
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  beerId: string
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by beer', beerId)
  return await listByBeer(beerId)
}

export async function listStoragesByBrewery (
  listByBrewery: (breweryId: string) => Promise<JoinedStorage[]>,
  breweryId: string
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by brewery', breweryId)
  return await listByBrewery(breweryId)
}

export async function listStoragesByStyle (
  listByStyle: (styleId: string) => Promise<JoinedStorage[]>,
  styleId: string
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by style', styleId)
  return await listByStyle(styleId)
}
