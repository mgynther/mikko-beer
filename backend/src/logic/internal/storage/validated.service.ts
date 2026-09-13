import * as storageService from './service.js'

import type {
  AnnualStorageStats,
  CreateIf,
  JoinedStorage,
  MonthlyStorageStats,
  StorageWithDate,
  UpdateIf,
  ValidateCreateStorage,
  ValidateStorageId,
  ValidateUpdateStorage,
} from '../../storage/storage.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { ValidateBeerId } from '../../beer/beer.js'
import type { ValidateBreweryId } from '../../brewery/brewery.js'
import {
  invalidBeerIdError,
  invalidBreweryIdError,
  invalidStorageError,
  invalidStorageIdError,
  invalidStyleIdError,
} from '../../errors.js'
import type { ValidateStyleId } from '../../style/style.js'

export async function createStorage(
  createIf: CreateIf,
  validate: ValidateCreateStorage,
  body: unknown,
  log: log,
): Promise<StorageWithDate> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-storage') {
    throw invalidStorageError
  }
  return await storageService.createStorage(
    createIf,
    validationResult.result,
    log,
  )
}

export async function updateStorage(
  updateIf: UpdateIf,
  validate: ValidateUpdateStorage,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<StorageWithDate> {
  const validationResult = validate(body, id)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-storage':
        throw invalidStorageError
      case 'invalid-storage-id':
        throw invalidStorageIdError
    }
  }
  return await storageService.updateStorage(
    updateIf,
    {
      ...validationResult.result.request,
      id: validationResult.result.id,
    },
    log,
  )
}

export async function deleteStorageById(
  deleteStorageById: (id: string) => Promise<void>,
  validateStorageId: ValidateStorageId,
  id: string | undefined,
  log: log,
): Promise<void> {
  const idResult = validateStorageId(id)
  if (idResult.errorCode === 'invalid-storage-id') {
    throw invalidStorageIdError
  }
  await storageService.deleteStorageById(
    deleteStorageById,
    idResult.result,
    log,
  )
}

export async function findStorageById(
  findById: (id: string) => Promise<JoinedStorage | undefined>,
  validateStorageId: ValidateStorageId,
  id: string | undefined,
  log: log,
): Promise<JoinedStorage> {
  const idResult = validateStorageId(id)
  if (idResult.errorCode === 'invalid-storage-id') {
    throw invalidStorageIdError
  }
  return await storageService.findStorageById(findById, idResult.result, log)
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
