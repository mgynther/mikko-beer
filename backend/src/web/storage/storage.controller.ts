import * as beerRepository from '../../data/beer/beer.repository'
import * as containerRepository from '../../data/container/container.repository'
import * as storageRepository from '../../data/storage/storage.repository'
import * as storageService from '../../core/storage/authorized.service'

import type { Transaction } from '../../data/database'
import type { Router } from '../router'
import type { Pagination } from '../../core/pagination'
import type {
  CreateIf,
  CreateStorageRequest,
  Storage,
  UpdateIf,
} from '../../core/storage/storage'
import { validatePagination } from '../../core/pagination'
import { parseAuthToken } from '../authentication/authentication-helper'

export function storageController (router: Router): void {
  router.post('/api/v1/storage',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(async (trx) => {
        const createIf: CreateIf = {
          insertStorage: async (
              createStorageRequest: CreateStorageRequest
          ) => await storageRepository.insertStorage(trx, createStorageRequest),
          lockBeer: createBeerLocker(trx),
          lockContainer: createContainerLocker(trx)
        }
        return await storageService.createStorage(
          createIf,
          {
            authTokenPayload,
            body
          },
          ctx.log
        )
      })

      ctx.status = 201
      ctx.body = {
        storage: result
      }
    }
  )

  router.put('/api/v1/storage/:storageId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request
      const storageId: string | undefined = ctx.params.storageId

      const result = await ctx.db.executeTransaction(async (trx) => {
        const updateIf: UpdateIf = {
          updateStorage: async (
            storage: Storage
          ) => await storageRepository.updateStorage(trx, storage),
          lockBeer: createBeerLocker(trx),
          lockContainer: createContainerLocker(trx)
        }
        return await storageService.updateStorage(
          updateIf,
          {
            authTokenPayload,
            id: storageId
          },
          body,
          ctx.log
        )
      })

      ctx.status = 200
      ctx.body = {
        storage: result
      }
    }
  )

  router.delete('/api/v1/storage/:storageId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const storageId: string | undefined = ctx.params.storageId

      await ctx.db.executeTransaction(async (trx) => {
        const deleteStorage: (id: string) => Promise<void> = async (
          storageId: string
          ) => { await storageRepository.deleteStorageById(trx, storageId); }
        await storageService.deleteStorageById(
          deleteStorage,
          {
            authTokenPayload,
            id: storageId
          },
          ctx.log
        );
      })

      ctx.status = 204
    }
  )

  router.get(
    '/api/v1/storage/:storageId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const storageId: string | undefined = ctx.params.storageId
      const storage = await storageService.findStorageById(async (
        storageId: string,
      ) => await storageRepository.findStorageById(ctx.db, storageId), {
        authTokenPayload,
        id: storageId
      }, ctx.log)

      ctx.body = { storage }
    }
  )

  router.get(
    '/api/v1/beer/:beerId/storage',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const beerId: string | undefined = ctx.params.beerId
      const storageResult = await storageService.listStoragesByBeer(async (
        beerId: string
      ) => await storageRepository.listStoragesByBeer(ctx.db, beerId), {
        authTokenPayload,
        id: beerId
      }, ctx.log)
      const storages = storageResult

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const breweryId: string | undefined = ctx.params.breweryId
      const storageResult = await storageService.listStoragesByBrewery(async (
        breweryId: string
      ) => await storageRepository.listStoragesByBrewery(ctx.db, breweryId), {
        authTokenPayload,
        id: breweryId
      }, ctx.log)
      const storages = storageResult

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/style/:styleId/storage',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const styleId: string | undefined = ctx.params.styleId
      const storageResult = await storageService.listStoragesByStyle(async (
        styleId: string
      ) => await storageRepository.listStoragesByStyle(ctx.db, styleId), {
        authTokenPayload,
        id: styleId
      }, ctx.log)
      const storages = storageResult

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/storage',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const storages = await storageService.listStorages(
        async (
          pagination: Pagination
        ) => await storageRepository.listStorages(
          ctx.db,
          pagination
        ),
        authTokenPayload,
        pagination,
        ctx.log
      )
      ctx.body = { storages, pagination }
    }
  )
}

function createBeerLocker (
  trx: Transaction
): (id: string) => Promise<string | undefined> {
  return async function(id: string): Promise<string | undefined> {
    return await beerRepository.lockBeer(trx, id)
  }
}

function createContainerLocker (
  trx: Transaction
): (id: string) => Promise<string | undefined> {
  return async function(id: string): Promise<string | undefined> {
    return await containerRepository.lockContainer(trx, id)
  }
}
