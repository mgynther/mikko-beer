import * as breweryService from './brewery.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import {
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from './brewery'
import { ControllerError } from '../util/errors'

export function breweryController (router: Router): void {
  router.post('/api/v1/brewery',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createBreweryRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.createBrewery(trx, createBreweryRequest)
      })

      ctx.status = 201
      ctx.body = {
        brewery: result
      }
    }
  )

  router.put('/api/v1/brewery/:breweryId',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { breweryId } = ctx.params

      const updateBreweryRequest = validateUpdateRequest(body, breweryId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.updateBrewery(
          trx, breweryId, updateBreweryRequest)
      })

      ctx.status = 200
      ctx.body = {
        brewery: result
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    authService.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const brewery = await breweryService.findBreweryById(ctx.db, breweryId)

      if (brewery == null) {
        throw new ControllerError(
          404,
          'BreweryNotFound',
          `brewery with id ${breweryId} was not found`
        )
      }

      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/brewery',
    authService.authenticateViewer,
    async (ctx) => {
      const breweries = await breweryService.listBreweries(ctx.db)
      ctx.body = { breweries }
    }
  )
}

function validateCreateRequest (body: unknown): CreateBreweryRequest {
  if (!validateCreateBreweryRequest(body)) {
    throw new ControllerError(400, 'InvalidBrewery', 'invalid brewery')
  }

  const result = body as CreateBreweryRequest
  return result
}

function validateUpdateRequest (
  body: unknown,
  breweryId: string
): UpdateBreweryRequest {
  if (!validateUpdateBreweryRequest(body)) {
    throw new ControllerError(400, 'InvalidBrewery', 'invalid brewery')
  }
  if (typeof breweryId !== 'string' || breweryId.length === 0) {
    throw new ControllerError(400, 'InvalidBreweryId', 'invalid brewery id')
  }

  const result = body as UpdateBreweryRequest
  return result
}
