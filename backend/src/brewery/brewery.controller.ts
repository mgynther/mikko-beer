import * as breweryService from './brewery.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type CreateBreweryRequest, validateCreateBreweryRequest } from './brewery'
import { ControllerError } from '../util/errors'

export function breweryController (router: Router): void {
  router.post('/api/v1/brewery',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request

      const createBreweryRequest = validateCreateRequest(body)
      const result = await ctx.db.transaction().execute(async (trx) => {
        return await breweryService.createBrewery(trx, createBreweryRequest)
      })

      ctx.status = 201
      ctx.body = {
        brewery: result
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    authenticationService.authenticateGeneric,
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
    authenticationService.authenticateGeneric,
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
