import * as storageService from './service'

import type {
  CreateIf,
  JoinedStorage,
  StorageWithDate,
  UpdateIf
} from "../../storage";
import {
  validateCreateStorageRequest,
  validateStorageId,
  validateUpdateStorageRequest
} from "../../storage";
import type { log } from '../../log'
import type { Pagination } from '../../pagination';
import { validateBeerId } from '../../beer';
import { validateBreweryId } from '../../brewery';
import { validateStyleId } from '../../style';

export async function createStorage (
  createIf: CreateIf,
  body: unknown,
  log: log
): Promise<StorageWithDate> {
  const createRequest = validateCreateStorageRequest(body)
  return await storageService.createStorage(createIf, createRequest, log)
}

export async function updateStorage (
  updateIf: UpdateIf,
  id: string | undefined,
  body: unknown,
  log: log
): Promise<StorageWithDate> {
  const updateRequest = validateUpdateStorageRequest(body, id)
  return await storageService.updateStorage(
    updateIf,
    {
      ...updateRequest.request,
      id: updateRequest.id,
    },
    log
  )
}

export async function deleteStorageById (
  deleteStorageById: (id: string) => Promise<void>,
  id: string | undefined,
  log: log
): Promise<void> {
  await storageService.deleteStorageById(
    deleteStorageById,
    validateStorageId(id),
    log
  );
}

export async function findStorageById (
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  id: string | undefined,
  log: log
): Promise<JoinedStorage | undefined> {
  return await storageService.findStorageById(
    findById,
    validateStorageId(id),
    log
  )
}

export async function listStorages (
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  pagination: Pagination,
  log: log
): Promise<JoinedStorage[]> {
  return await storageService.listStorages(
    list,
    pagination,
    log
  )
}

export async function listStoragesByBeer (
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  beerId: string | undefined,
  log: log
): Promise<JoinedStorage[]> {
  return await storageService.listStoragesByBeer(
    listByBeer,
    validateBeerId(beerId),
    log
  )
}

export async function listStoragesByBrewery (
  listByBrewery: (beerId: string) => Promise<JoinedStorage[]>,
  breweryId: string | undefined,
  log: log
): Promise<JoinedStorage[]> {
  return await storageService.listStoragesByBrewery(
    listByBrewery,
    validateBreweryId(breweryId),
    log
  )
}

export async function listStoragesByStyle (
  listByStyle: (beerId: string) => Promise<JoinedStorage[]>,
  styleId: string | undefined,
  log: log
): Promise<JoinedStorage[]> {
  return await storageService.listStoragesByStyle(
    listByStyle,
    validateStyleId(styleId),
    log
  )
}
