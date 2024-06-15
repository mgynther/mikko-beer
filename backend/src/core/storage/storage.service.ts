import {
  type CreateStorageRequest,
  type JoinedStorage,
  type Storage
} from '../../core/storage/storage'

import { type Pagination } from '../../core/pagination'

export async function createStorage (
  insert: (request: CreateStorageRequest) => Promise<Storage>,
  request: CreateStorageRequest
): Promise<Storage> {
  const storage = await insert(request)

  return {
    ...storage
  }
}

export async function updateStorage (
  update: (request: Storage) => Promise<Storage>,
  request: Storage
): Promise<Storage> {
  const storage = await update(request)

  return {
    ...storage
  }
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  storageId: string
): Promise<JoinedStorage | undefined> {
  const storage = await findById(storageId)

  if (storage === undefined) return undefined

  return storage
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  pagination: Pagination
): Promise<JoinedStorage[]> {
  return await list(pagination)
}

export async function listStoragesByBeer (
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  beerId: string
): Promise<JoinedStorage[]> {
  return await listByBeer(beerId)
}

export async function listStoragesByBrewery (
  listByBrewery: (breweryId: string) => Promise<JoinedStorage[]>,
  breweryId: string
): Promise<JoinedStorage[]> {
  return await listByBrewery(breweryId)
}

export async function listStoragesByStyle (
  listByStyle: (styleId: string) => Promise<JoinedStorage[]>,
  styleId: string
): Promise<JoinedStorage[]> {
  return await listByStyle(styleId)
}
