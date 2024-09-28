import type {
  CreateStorageRequest,
  JoinedStorage,
  Storage
} from '../../core/storage/storage'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  storageNotFoundError
} from '../errors'
import { INFO, type log } from '../log'

import type { Pagination } from '../../core/pagination'

type LockId = (id: string) => Promise<string | undefined>

export interface CreateIf {
  insertStorage: (request: CreateStorageRequest) => Promise<Storage>
  lockBeer: LockId
  lockContainer: LockId
}

export async function createStorage (
  createIf: CreateIf,
  request: CreateStorageRequest,
  log: log
): Promise<Storage> {
  log(INFO, 'create storage for beer', request.beer)
  await lockId(createIf.lockBeer, request.beer, referredBeerNotFoundError)
  await lockId(
    createIf.lockContainer,
    request.container,
    referredContainerNotFoundError
  )
  const storage = await createIf.insertStorage(request)

  log(INFO, 'created storage for beer', request.beer)
  return {
    ...storage
  }
}

export interface UpdateIf {
  updateStorage: (request: Storage) => Promise<Storage>
  lockBeer: LockId
  lockContainer: LockId
}

export async function updateStorage (
  updateIf: UpdateIf,
  request: Storage,
  log: log
): Promise<Storage> {
  log(INFO, 'update storage', request.id)
  await lockId(updateIf.lockBeer, request.beer, referredBeerNotFoundError)
  await lockId(
    updateIf.lockContainer,
    request.container,
    referredContainerNotFoundError
  )
  const storage = await updateIf.updateStorage(request)

  log(INFO, 'updated storage', request.id)
  return {
    ...storage
  }
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  storageId: string,
  log: log
): Promise<JoinedStorage | undefined> {
  log(INFO, 'find storage', storageId)
  const storage = await findById(storageId)

  if (storage === undefined) throw storageNotFoundError(storageId)

  return storage
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  pagination: Pagination,
  log: log
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages', pagination)
  return await list(pagination)
}

export async function listStoragesByBeer (
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  beerId: string,
  log: log
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by beer', beerId)
  return await listByBeer(beerId)
}

export async function listStoragesByBrewery (
  listByBrewery: (breweryId: string) => Promise<JoinedStorage[]>,
  breweryId: string,
  log: log
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by brewery', breweryId)
  return await listByBrewery(breweryId)
}

export async function listStoragesByStyle (
  listByStyle: (styleId: string) => Promise<JoinedStorage[]>,
  styleId: string,
  log: log
): Promise<JoinedStorage[]> {
  log(INFO, 'list storages by style', styleId)
  return await listByStyle(styleId)
}

async function lockId (
  lockId: LockId,
  key: string,
  error: Error
): Promise<void> {
  const lockedId = await lockId(key)
  if (lockedId === undefined) {
    throw error
  }
}
