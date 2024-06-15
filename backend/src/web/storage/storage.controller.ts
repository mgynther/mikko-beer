import * as storageRepository from '../../data/storage/storage.repository'
import * as storageService from '../../core/storage/storage.service'
import * as authService from '../authentication/authentication.service'

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
import { validatePagination } from '../pagination'

export function storageController (router: Router): void {
  router.post('/api/v1/storage',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createStorageRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await storageService.createStorage((
          createStorageRequest: CreateStorageRequest
        ) => {
          return storageRepository.insertStorage(trx, createStorageRequest)
        }, createStorageRequest)
      })

      ctx.status = 201
      ctx.body = {
        storage: result
      }
    }
  )

  router.put('/api/v1/storage/:storageId',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { storageId } = ctx.params

      const updateStorageRequest = validateUpdateRequest(body, storageId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await storageService.updateStorage((
          storage: Storage
        ) => {
          return storageRepository.updateStorage(trx, storage)
        }, { ...updateStorageRequest, id: storageId })
      })

      ctx.status = 200
      ctx.body = {
        storage: result
      }
    }
  )

  router.get(
    '/api/v1/storage/:storageId',
    authService.authenticateViewer,
    async (ctx) => {
      const { storageId } = ctx.params
      const storage = await storageService.findStorageById((
        storageId: string,
      ) => {
        return storageRepository.findStorageById(ctx.db, storageId)
      }, storageId)

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
    authService.authenticateViewer,
    async (ctx) => {
      const { beerId } = ctx.params
      const storageResult = await storageService.listStoragesByBeer((
        beerId: string
      ) => {
        return storageRepository.listStoragesByBeer(ctx.db, beerId)
      }, beerId)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    authService.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const storageResult = await storageService.listStoragesByBrewery((
        breweryId: string
      ) => {
        return storageRepository.listStoragesByBrewery(ctx.db, breweryId)
      }, breweryId)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/style/:styleId/storage',
    authService.authenticateViewer,
    async (ctx) => {
      const { styleId } = ctx.params
      const storageResult = await storageService.listStoragesByStyle((
        styleId: string
      ) => {
        return storageRepository.listStoragesByStyle(ctx.db, styleId)
      }, styleId)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/storage',
    authService.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const storages = await storageService.listStorages((
        pagination: Pagination
      ) => {
        return storageRepository.listStorages(ctx.db, pagination)
      }, pagination)
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
