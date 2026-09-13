import * as storageService from './service.js'

import type {
  AnnualStorageStats,
  CreateIf,
  JoinedStorage,
  MonthlyStorageStats,
  StorageWithDate,
  UpdateIf,
} from '../../storage/storage.js'
import {
  validateCreateStorageRequest,
  validateStorageId,
  validateUpdateStorageRequest,
} from './validation.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { ValidateBeerId } from '../../beer/beer.js'
import type { ValidateBreweryId } from '../../brewery/brewery.js'
import {
  invalidBeerIdError,
  invalidBreweryIdError,
  invalidStyleIdError,
} from '../../errors.js'
import type { ValidateStyleId } from '../../style/style.js'

export async function createStorage(
  createIf: CreateIf,
  body: unknown,
  log: log,
): Promise<StorageWithDate> {
  const createRequest = validateCreateStorageRequest(body)
  return await storageService.createStorage(createIf, createRequest, log)
}

export async function updateStorage(
  updateIf: UpdateIf,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<StorageWithDate> {
  const updateRequest = validateUpdateStorageRequest(body, id)
  return await storageService.updateStorage(
    updateIf,
    {
      ...updateRequest.request,
      id: updateRequest.id,
    },
    log,
  )
}

export async function deleteStorageById(
  deleteStorageById: (id: string) => Promise<void>,
  id: string | undefined,
  log: log,
): Promise<void> {
  await storageService.deleteStorageById(
    deleteStorageById,
    validateStorageId(id),
    log,
  )
}

export async function findStorageById(
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  id: string | undefined,
  log: log,
): Promise<JoinedStorage> {
  return await storageService.findStorageById(
    findById,
    validateStorageId(id),
    log,
  )
}

export async function listStorages(
  list: (pagination: Pagination) => Promise<JoinedStorage[]>,
  pagination: Pagination,
  log: log,
): Promise<JoinedStorage[]> {
  return await storageService.listStorages(list, pagination, log)
}

export async function listStoragesByBeer(
  listByBeer: (beerId: string) => Promise<JoinedStorage[]>,
  validateBeerId: ValidateBeerId,
  beerId: string | undefined,
  log: log,
): Promise<JoinedStorage[]> {
  const idResult = validateBeerId(beerId)
  if (idResult.errorCode === 'invalid-beer-id') {
    throw invalidBeerIdError
  }
  return await storageService.listStoragesByBeer(
    listByBeer,
    idResult.result,
    log,
  )
}

export async function listStoragesByBrewery(
  listByBrewery: (beerId: string) => Promise<JoinedStorage[]>,
  validateBreweryId: ValidateBreweryId,
  breweryId: string | undefined,
  log: log,
): Promise<JoinedStorage[]> {
  const idResult = validateBreweryId(breweryId)
  if (idResult.errorCode === 'invalid-brewery-id') {
    throw invalidBreweryIdError
  }
  return await storageService.listStoragesByBrewery(
    listByBrewery,
    idResult.result,
    log,
  )
}

export async function listStoragesByStyle(
  listByStyle: (beerId: string) => Promise<JoinedStorage[]>,
  validateStyleId: ValidateStyleId,
  styleId: string | undefined,
  log: log,
): Promise<JoinedStorage[]> {
  const idResult = validateStyleId(styleId)
  if (idResult.errorCode === 'invalid-style-id') {
    throw invalidStyleIdError
  }
  return await storageService.listStoragesByStyle(
    listByStyle,
    idResult.result,
    log,
  )
}

export async function getAnnualStorageStats(
  getAnnualStats: () => Promise<AnnualStorageStats>,
  log: log,
): Promise<AnnualStorageStats> {
  return await storageService.getAnnualStorageStats(getAnnualStats, log)
}

export async function getMonthlyStorageStats(
  getMonthlyStats: () => Promise<MonthlyStorageStats>,
  log: log,
): Promise<MonthlyStorageStats> {
  return await storageService.getMonthlyStorageStats(getMonthlyStats, log)
}
