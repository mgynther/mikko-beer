import * as beerRepository from '../../data/beer/beer.repository'
import * as containerRepository from '../../data/container/container.repository'
import * as storageRepository from '../../data/storage/storage.repository'
import * as storageService from '../../core/storage/storage.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Transaction } from '../../data/database'
import { type Router } from '../router'
import { type Pagination } from '../../core/pagination'
import {
  type CreateStorageRequest,
  type Storage,
  type UpdateStorageRequest,
  validateCreateStorageRequest,
  validateUpdateStorageRequest
} from '../../core/storage/storage'
import { ControllerError } from '../../core/errors'
import {
  type CreateIf,
  type UpdateIf,
  BeerNotFoundError,
  ContainerNotFoundError
} from '../../core/storage/storage.service'
import { validatePagination } from '../pagination'

function handleError (e: unknown): void {
  if (e instanceof BeerNotFoundError) {
    throw new ControllerError(
      400,
      'BeerNotFound',
      'beer not found'
    )
  }
  if (e instanceof ContainerNotFoundError) {
    throw new ControllerError(
      400,
      'ContainerNotFound',
      'container not found'
    )
  }
  throw e
}

export function storageController (router: Router): void {
  router.post('/api/v1/storage',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      try {
        const createStorageRequest = validateCreateRequest(body)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const createIf: CreateIf = {
            insertStorage: (
                createStorageRequest: CreateStorageRequest
            ) => {
                return storageRepository.insertStorage(trx, createStorageRequest)
            },
            lockBeer: createBeerLocker(trx),
            lockContainer: createContainerLocker(trx)
          }
          return await storageService.createStorage(
            createIf,
            createStorageRequest,
            ctx.log
          )
        })

        ctx.status = 201
        ctx.body = {
          storage: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.put('/api/v1/storage/:storageId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { storageId } = ctx.params

      try {
        const updateStorageRequest = validateUpdateRequest(body, storageId)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const updateIf: UpdateIf = {
            updateStorage: (
              storage: Storage
            ) => {
              return storageRepository.updateStorage(trx, storage)
            },
            lockBeer: createBeerLocker(trx),
            lockContainer: createContainerLocker(trx)
          }
          return await storageService.updateStorage(
            updateIf,
            { ...updateStorageRequest, id: storageId },
            ctx.log
          )
        })

        ctx.status = 200
        ctx.body = {
          storage: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.get(
    '/api/v1/storage/:storageId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { storageId } = ctx.params
      const storage = await storageService.findStorageById((
        storageId: string,
      ) => {
        return storageRepository.findStorageById(ctx.db, storageId)
      }, storageId, ctx.log)

      if (storage === undefined) {
        throw new ControllerError(
          404,
          'StorageNotFound',
          `storage with id ${storageId} was not found`
        )
      }

      ctx.body = { storage }
    }
  )

  router.get(
    '/api/v1/beer/:beerId/storage',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { beerId } = ctx.params
      const storageResult = await storageService.listStoragesByBeer((
        beerId: string
      ) => {
        return storageRepository.listStoragesByBeer(ctx.db, beerId)
      }, beerId, ctx.log)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const storageResult = await storageService.listStoragesByBrewery((
        breweryId: string
      ) => {
        return storageRepository.listStoragesByBrewery(ctx.db, breweryId)
      }, breweryId, ctx.log)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/style/:styleId/storage',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { styleId } = ctx.params
      const storageResult = await storageService.listStoragesByStyle((
        styleId: string
      ) => {
        return storageRepository.listStoragesByStyle(ctx.db, styleId)
      }, styleId, ctx.log)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/storage',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const storages = await storageService.listStorages((
        pagination: Pagination
      ) => {
        return storageRepository.listStorages(ctx.db, pagination)
      }, pagination, ctx.log)
      ctx.body = { storages, pagination }
    }
  )
}

function validateCreateRequest (body: unknown): CreateStorageRequest {
  if (!validateCreateStorageRequest(body)) {
    throw new ControllerError(400, 'InvalidStorage', 'invalid storage')
  }

  const result = body as CreateStorageRequest
  return result
}

function validateUpdateRequest (
  body: unknown,
  storageId: string
): UpdateStorageRequest {
  if (!validateUpdateStorageRequest(body)) {
    throw new ControllerError(400, 'InvalidStorage', 'invalid storage')
  }
  if (typeof storageId !== 'string' || storageId.length === 0) {
    throw new ControllerError(400, 'InvalidStorageId', 'invalid storage id')
  }

  const result = body as UpdateStorageRequest
  return result
}

function createBeerLocker (
  trx: Transaction
): (id: string) => Promise<string | undefined> {
  return function(id: string): Promise<string | undefined> {
    return beerRepository.lockBeer(trx, id)
  }
}

function createContainerLocker (
  trx: Transaction
): (id: string) => Promise<string | undefined> {
  return function(id: string): Promise<string | undefined> {
    return containerRepository.lockContainer(trx, id)
  }
}
