import * as storageService from '../../logic/storage/authorized.service.js'
import type {
  AnnualStorageStats,
  CreateIf,
  CreateStorageRequest,
  JoinedStorage,
  MonthlyStorageStats,
  Storage,
  StorageWithDate,
  UpdateIf,
} from '../../logic/storage/storage.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as containerRepository from '../../data/container/container.repository.js'
import type { Transaction } from '../../data/database.js'
import * as storageRepository from '../../data/storage/storage.repository.js'

import { validateBeerId } from '../../validation/beer.js'
import { validateBreweryId } from '../../validation/brewery.js'
import { validatePagination } from '../../validation/pagination.js'
import {
  validateCreateStorageRequest,
  validateStorageId,
  validateUpdateStorageRequest,
} from '../../validation/storage.js'
import { validateStyleId } from '../../validation/style.js'

import type {
  AnnualStorageStatsBody,
  CreatedOrUpdatedStorage,
  MonthlyStorageStatsBody,
  ReadStorage,
  ReadStorageBody,
  StorageBody,
  StorageHandlers,
  StorageListBody,
  StoragesBody,
} from '../../web/storage/storage.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createStorageHandlers(context: Context): StorageHandlers {
  const { config, db, log } = context
  return {
    getAnnualStats: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
      ): Promise<AnnualStorageStatsBody> => {
        const annual = await storageService.getAnnualStorageStats(
          async (): Promise<AnnualStorageStats> =>
            await storageRepository.getAnnualStorageStats(db),
          authTokenPayload,
          log,
        )
        return { annual }
      },
    ),

    getMonthlyStats: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
      ): Promise<MonthlyStorageStatsBody> => {
        const monthly = await storageService.getMonthlyStorageStats(
          async (): Promise<MonthlyStorageStats> =>
            await storageRepository.getMonthlyStorageStats(db),
          authTokenPayload,
          log,
        )
        return { monthly }
      },
    ),

    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<StorageBody> => {
        const storage = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<StorageWithDate> => {
            const createIf: CreateIf = {
              insertStorage: async (
                createStorageRequest: CreateStorageRequest,
              ): Promise<StorageWithDate> =>
                await storageRepository.insertStorage(
                  trx,
                  createStorageRequest,
                ),
              lockBeer: createBeerLocker(trx),
              lockContainer: createContainerLocker(trx),
            }
            return await storageService.createStorage(
              createIf,
              validateCreateStorageRequest,
              { authTokenPayload, body: request.body },
              log,
            )
          },
        )
        return { storage: toCreatedOrUpdatedStorage(storage) }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<StorageBody> => {
        const storage = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<StorageWithDate> => {
            const updateIf: UpdateIf = {
              updateStorage: async (
                storage: Storage,
              ): Promise<StorageWithDate | undefined> =>
                await storageRepository.updateStorage(trx, storage),
              lockBeer: createBeerLocker(trx),
              lockContainer: createContainerLocker(trx),
            }
            return await storageService.updateStorage(
              updateIf,
              validateUpdateStorageRequest,
              { authTokenPayload, id: request.id },
              request.body,
              log,
            )
          },
        )
        return { storage: toCreatedOrUpdatedStorage(storage) }
      },
    ),

    delete: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<void> => {
        await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<void> => {
            await storageService.deleteStorageById(
              async (storageId: string): Promise<void> => {
                await storageRepository.deleteStorageById(trx, storageId)
              },
              validateStorageId,
              { authTokenPayload, id: request.id },
              log,
            )
          },
        )
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadStorageBody> => {
        const storage = await storageService.findStorageById(
          async (storageId: string): Promise<JoinedStorage | undefined> =>
            await storageRepository.findStorageById(db, storageId),
          validateStorageId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { storage: toReadStorage(storage) }
      },
    ),

    listByBeer: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<StoragesBody> => {
        const storages = await storageService.listStoragesByBeer(
          async (beerId: string): Promise<JoinedStorage[]> =>
            await storageRepository.listStoragesByBeer(db, beerId),
          validateBeerId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { storages: storages.map(toReadStorage) }
      },
    ),

    listByBrewery: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<StoragesBody> => {
        const storages = await storageService.listStoragesByBrewery(
          async (breweryId: string): Promise<JoinedStorage[]> =>
            await storageRepository.listStoragesByBrewery(db, breweryId),
          validateBreweryId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { storages: storages.map(toReadStorage) }
      },
    ),

    listByStyle: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<StoragesBody> => {
        const storages = await storageService.listStoragesByStyle(
          async (styleId: string): Promise<JoinedStorage[]> =>
            await storageRepository.listStoragesByStyle(db, styleId),
          validateStyleId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { storages: storages.map(toReadStorage) }
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginationRequest,
      ): Promise<StorageListBody> => {
        const { storages, pagination } = await storageService.listStorages(
          async (pagination: Pagination): Promise<JoinedStorage[]> =>
            await storageRepository.listStorages(db, pagination),
          validatePagination,
          { authTokenPayload, pagination: request.pagination },
          log,
        )
        return { storages: storages.map(toReadStorage), pagination }
      },
    ),
  }
}

function toCreatedOrUpdatedStorage(
  storage: StorageWithDate,
): CreatedOrUpdatedStorage {
  return {
    ...storage,
    bestBefore: storage.bestBefore.toISOString(),
  }
}

function toReadStorage(storage: JoinedStorage): ReadStorage {
  return {
    ...storage,
    bestBefore: storage.bestBefore.toISOString(),
    createdAt: storage.createdAt.toISOString(),
  }
}

function createBeerLocker(
  trx: Transaction,
): (id: string) => Promise<string | undefined> {
  return async function (id: string): Promise<string | undefined> {
    return await beerRepository.lockBeer(trx, id)
  }
}

function createContainerLocker(
  trx: Transaction,
): (id: string) => Promise<string | undefined> {
  return async function (id: string): Promise<string | undefined> {
    return await containerRepository.lockContainer(trx, id)
  }
}
