import * as storageService from './storage.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import {
  type CreateStorageRequest,
  type UpdateStorageRequest,
  validateCreateStorageRequest,
  validateUpdateStorageRequest
} from './storage'
import { ControllerError } from '../util/errors'
import { validatePagination } from '../util/pagination'

export function storageController (router: Router): void {
  router.post('/api/v1/storage',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createStorageRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await storageService.createStorage(trx, createStorageRequest)
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
        return await storageService.updateStorage(
          trx, storageId, updateStorageRequest)
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
      const storage = await storageService.findStorageById(ctx.db, storageId)

      if (storage == null) {
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
      const storageResult =
        await storageService.listStoragesByBeer(ctx.db, beerId)
      const storages = storageResult ?? []

      ctx.body = { storages }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    authService.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const storageResult =
        await storageService.listStoragesByBrewery(ctx.db, breweryId)
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
      const storages = await storageService.listStorages(ctx.db, pagination)
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
