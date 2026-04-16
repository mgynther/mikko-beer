import * as storageService from '../../core/storage/authorized.service.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as containerRepository from '../../data/container/container.repository.js'
import * as storageRepository from '../../data/storage/storage.repository.js'

import type { Pagination } from '../../core/pagination.js'
import type {
  CreateIf,
  CreateStorageRequest,
  Storage,
  UpdateIf,
} from '../../core/storage/storage.js'
import { validatePagination } from '../../core/pagination.js'
import type { Transaction } from '../../data/database.js'
import type { Router } from '../router.js'

import { parseAuthToken } from '../authentication/authentication-helper.js'
import type { Context } from '../context.js'

export function storageController(router: Router): void {
  router.get('/api/v1/storage/annual-stats', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const annual = await storageService.getAnnualStorageStats(
      async () => await storageRepository.getAnnualStorageStats(ctx.db),
      authTokenPayload,
      ctx.log,
    )
    return {
      status: 200,
      body: { annual },
    }
  })

  router.get('/api/v1/storage/monthly-stats', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const monthly = await storageService.getMonthlyStorageStats(
      async () => await storageRepository.getMonthlyStorageStats(ctx.db),
      authTokenPayload,
      ctx.log,
    )
    return {
      status: 200,
      body: { monthly },
    }
  })

  router.post('/api/v1/storage', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const body: unknown = ctx.request.body

    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const createIf: CreateIf = {
        insertStorage: async (createStorageRequest: CreateStorageRequest) =>
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
    })

    return {
      status: 201,
      body: {
        storage: result,
      },
    }
  })

  router.put('/api/v1/storage/:storageId', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const body: unknown = ctx.request.body
    const storageId: string | undefined = ctx.params.storageId

    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const updateIf: UpdateIf = {
        updateStorage: async (storage: Storage) =>
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
    })

    return {
      status: 200,
      body: {
        storage: result,
      },
    }
  })

  router.delete('/api/v1/storage/:storageId', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const storageId: string | undefined = ctx.params.storageId

    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const deleteStorage: (id: string) => Promise<void> = async (
        storageId: string,
      ) => {
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
  })

  router.get('/api/v1/storage/:storageId', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const storageId: string | undefined = ctx.params.storageId
    const storage = await storageService.findStorageById(
      async (storageId: string) =>
        await storageRepository.findStorageById(ctx.db, storageId),
      {
        authTokenPayload,
        id: storageId,
      },
      ctx.log,
    )

    return {
      status: 200,
      body: { storage },
    }
  })

  router.get('/api/v1/beer/:beerId/storage', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const beerId: string | undefined = ctx.params.beerId
    const storageResult = await storageService.listStoragesByBeer(
      async (beerId: string) =>
        await storageRepository.listStoragesByBeer(ctx.db, beerId),
      {
        authTokenPayload,
        id: beerId,
      },
      ctx.log,
    )
    const storages = storageResult

    return {
      status: 200,
      body: { storages },
    }
  })

  router.get('/api/v1/brewery/:breweryId/storage', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const breweryId: string | undefined = ctx.params.breweryId
    const storageResult = await storageService.listStoragesByBrewery(
      async (breweryId: string) =>
        await storageRepository.listStoragesByBrewery(ctx.db, breweryId),
      {
        authTokenPayload,
        id: breweryId,
      },
      ctx.log,
    )
    const storages = storageResult

    return {
      status: 200,
      body: { storages },
    }
  })

  router.get('/api/v1/style/:styleId/storage', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const styleId: string | undefined = ctx.params.styleId
    const storageResult = await storageService.listStoragesByStyle(
      async (styleId: string) =>
        await storageRepository.listStoragesByStyle(ctx.db, styleId),
      {
        authTokenPayload,
        id: styleId,
      },
      ctx.log,
    )
    const storages = storageResult

    return {
      status: 200,
      body: { storages },
    }
  })

  router.get('/api/v1/storage', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const { skip, size } = ctx.request.query
    const pagination = validatePagination({ skip, size })
    const storages = await storageService.listStorages(
      async (pagination: Pagination) =>
        await storageRepository.listStorages(ctx.db, pagination),
      authTokenPayload,
      pagination,
      ctx.log,
    )
    return {
      status: 200,
      body: { storages, pagination },
    }
  })
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
