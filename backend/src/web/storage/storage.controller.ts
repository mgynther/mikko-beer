import * as storageService from '../../core/storage/authorized.service.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as containerRepository from '../../data/container/container.repository.js'
import * as storageRepository from '../../data/storage/storage.repository.js'

import type { Pagination } from '../../core/pagination.js'
import type {
  AnnualStorageStats as CoreAnnualStorageStats,
  CreateIf,
  CreateStorageRequest,
  JoinedStorage,
  MonthlyStorageStats as CoreMonthlyStorageStats,
  Storage,
  StorageWithDate,
  UpdateIf,
} from '../../core/storage/storage.js'
import { validatePagination } from '../../core/pagination.js'
import type { Transaction } from '../../data/database.js'
import type { Router } from '../router.js'

import { parseAuthToken } from '../authentication/authentication-helper.js'
import type { Context } from '../context.js'

export type AnnualStorageStats = Array<{
  year: string
  count: string
}>

interface AnnualStatsResult {
  status: 200
  body: {
    annual: AnnualStorageStats
  }
}

export type MonthlyStorageStats = Array<{
  year: string
  month: string
  count: string
}>

interface MonthlyStatsResult {
  status: 200
  body: {
    monthly: MonthlyStorageStats
  }
}

export interface CreatedOrUpdatedStorage {
  id: string
  bestBefore: string
  beer: string
  container: string
}

interface CreateResult {
  status: 201
  body: {
    storage: CreatedOrUpdatedStorage
  }
}

interface UpdateResult {
  status: 200
  body: {
    storage: CreatedOrUpdatedStorage
  }
}

interface DeleteResult {
  status: 204
  body: undefined
}

export interface ReadStorage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: Array<{
    id: string
    name: string
  }>
  container: {
    id: string
    type: string
    size: string
  }
  createdAt: string
  hasReview: boolean
  styles: Array<{
    id: string
    name: string
  }>
}

interface ReadResult {
  status: 200
  body: {
    storage: ReadStorage
  }
}

interface ListByBeerResult {
  status: 200
  body: {
    storages: Array<ReadStorage>
  }
}

interface ListByBreweryResult {
  status: 200
  body: {
    storages: Array<ReadStorage>
  }
}

interface ListByStyleResult {
  status: 200
  body: {
    storages: Array<ReadStorage>
  }
}

interface ListResult {
  status: 200
  body: {
    storages: Array<ReadStorage>
    pagination: {
      size: number
      skip: number
    }
  }
}

export function storageController(router: Router): void {
  router.get(
    '/api/v1/storage/annual-stats',
    async (ctx: Context): Promise<AnnualStatsResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const annual = await storageService.getAnnualStorageStats(
        async (): Promise<CoreAnnualStorageStats> =>
          await storageRepository.getAnnualStorageStats(ctx.db),
        authTokenPayload,
        ctx.log,
      )
      return {
        status: 200,
        body: { annual },
      }
    },
  )

  router.get(
    '/api/v1/storage/monthly-stats',
    async (ctx: Context): Promise<MonthlyStatsResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const monthly = await storageService.getMonthlyStorageStats(
        async (): Promise<CoreMonthlyStorageStats> =>
          await storageRepository.getMonthlyStorageStats(ctx.db),
        authTokenPayload,
        ctx.log,
      )
      return {
        status: 200,
        body: { monthly },
      }
    },
  )

  router.post(
    '/api/v1/storage',
    async (ctx: Context): Promise<CreateResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<StorageWithDate> => {
          const createIf: CreateIf = {
            insertStorage: async (
              createStorageRequest: CreateStorageRequest,
            ): Promise<StorageWithDate> =>
              await storageRepository.insertStorage(trx, createStorageRequest),
            lockBeer: createBeerLocker(trx),
            lockContainer: createContainerLocker(trx),
          }
          return await storageService.createStorage(
            createIf,
            {
              authTokenPayload,
              body,
            },
            ctx.log,
          )
        },
      )

      return {
        status: 201,
        body: {
          storage: toCreatedOrUpdatedStorage(result),
        },
      }
    },
  )

  router.put(
    '/api/v1/storage/:storageId',
    async (ctx: Context): Promise<UpdateResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const storageId: string | undefined = ctx.params.storageId

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<StorageWithDate> => {
          const updateIf: UpdateIf = {
            updateStorage: async (storage: Storage): Promise<StorageWithDate> =>
              await storageRepository.updateStorage(trx, storage),
            lockBeer: createBeerLocker(trx),
            lockContainer: createContainerLocker(trx),
          }
          return await storageService.updateStorage(
            updateIf,
            {
              authTokenPayload,
              id: storageId,
            },
            body,
            ctx.log,
          )
        },
      )

      return {
        status: 200,
        body: {
          storage: toCreatedOrUpdatedStorage(result),
        },
      }
    },
  )

  router.delete(
    '/api/v1/storage/:storageId',
    async (ctx: Context): Promise<DeleteResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const storageId: string | undefined = ctx.params.storageId

      await ctx.db.executeReadWriteTransaction(async (trx): Promise<void> => {
        const deleteStorage: (id: string) => Promise<void> = async (
          storageId: string,
        ): Promise<void> => {
          await storageRepository.deleteStorageById(trx, storageId)
        }
        await storageService.deleteStorageById(
          deleteStorage,
          {
            authTokenPayload,
            id: storageId,
          },
          ctx.log,
        )
      })

      return {
        status: 204,
        body: undefined,
      }
    },
  )

  router.get(
    '/api/v1/storage/:storageId',
    async (ctx: Context): Promise<ReadResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const storageId: string | undefined = ctx.params.storageId
      const storage = await storageService.findStorageById(
        async (storageId: string): Promise<JoinedStorage | undefined> =>
          await storageRepository.findStorageById(ctx.db, storageId),
        {
          authTokenPayload,
          id: storageId,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { storage: toReadStorage(storage) },
      }
    },
  )

  router.get(
    '/api/v1/beer/:beerId/storage',
    async (ctx: Context): Promise<ListByBeerResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const beerId: string | undefined = ctx.params.beerId
      const storageResult = await storageService.listStoragesByBeer(
        async (beerId: string): Promise<JoinedStorage[]> =>
          await storageRepository.listStoragesByBeer(ctx.db, beerId),
        {
          authTokenPayload,
          id: beerId,
        },
        ctx.log,
      )
      const storages = storageResult.map(toReadStorage)

      return {
        status: 200,
        body: { storages },
      }
    },
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    async (ctx: Context): Promise<ListByBreweryResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const breweryId: string | undefined = ctx.params.breweryId
      const storageResult = await storageService.listStoragesByBrewery(
        async (breweryId: string): Promise<JoinedStorage[]> =>
          await storageRepository.listStoragesByBrewery(ctx.db, breweryId),
        {
          authTokenPayload,
          id: breweryId,
        },
        ctx.log,
      )
      const storages = storageResult.map(toReadStorage)

      return {
        status: 200,
        body: { storages },
      }
    },
  )

  router.get(
    '/api/v1/style/:styleId/storage',
    async (ctx: Context): Promise<ListByStyleResult> => {
      const authTokenPayload = parseAuthToken(ctx)
      const styleId: string | undefined = ctx.params.styleId
      const storageResult = await storageService.listStoragesByStyle(
        async (styleId: string): Promise<JoinedStorage[]> =>
          await storageRepository.listStoragesByStyle(ctx.db, styleId),
        {
          authTokenPayload,
          id: styleId,
        },
        ctx.log,
      )
      const storages = storageResult.map(toReadStorage)

      return {
        status: 200,
        body: { storages },
      }
    },
  )

  router.get('/api/v1/storage', async (ctx: Context): Promise<ListResult> => {
    const authTokenPayload = parseAuthToken(ctx)
    const { skip, size } = ctx.request.query
    const pagination = validatePagination({ skip, size })
    const storageResult = await storageService.listStorages(
      async (pagination: Pagination): Promise<JoinedStorage[]> =>
        await storageRepository.listStorages(ctx.db, pagination),
      authTokenPayload,
      pagination,
      ctx.log,
    )
    const storages = storageResult.map(toReadStorage)

    return {
      status: 200,
      body: { storages, pagination },
    }
  })
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
