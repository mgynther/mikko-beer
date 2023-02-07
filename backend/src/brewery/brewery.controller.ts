import * as breweryService from './brewery.service'
import * as authenticationService from '../authentication/authentication.service'

import { Router } from '../router'
import { validateCreateBreweryRequest } from './brewery'
import { ControllerError } from '../util/errors'

export function breweryController(router: Router): void {
  router.post('/api/v1/brewery',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request

      if (!validateCreateBreweryRequest(body)) {
        throw new ControllerError(400, 'InvalidBrewery', 'invalid brewery')
      }

      const result = await ctx.db.transaction().execute(async (trx) => {
        return breweryService.createBrewery(trx, body)
      })

      ctx.status = 201
      ctx.body = {
        brewery: result,
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { breweryId } = ctx.params
      const brewery = await breweryService.findBreweryById(ctx.db, breweryId)

      if (!brewery) {
        throw new ControllerError(
          404,
          'BreweryNotFound',
          `brewery with id ${breweryId} was not found`
        )
      }

      ctx.body = { brewery }
    }
  )
}
