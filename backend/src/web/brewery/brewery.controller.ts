import * as breweryService from './brewery.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import {
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from '../../core/brewery/brewery'
import { ControllerError } from '../errors'
import { validatePagination } from '../pagination'
import { validateSearchByName } from '../search'

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
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const breweries = await breweryService.listBreweries(ctx.db, pagination)
      ctx.body = { breweries, pagination }
    }
  )

  router.post('/api/v1/brewery/search',
    authService.authenticateViewer,
    async (ctx) => {
      const { body } = ctx.request

      const searchBreweryRequest = validateSearchByName(body)
      const breweries =
        await breweryService.searchBreweries(ctx.db, searchBreweryRequest)

      ctx.status = 200
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
