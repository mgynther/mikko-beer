import * as beerService from './beer.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type CreateBeerRequest, type UpdateBeerRequest, validateCreateBeerRequest, validateUpdateBeerRequest } from './beer'
import { ControllerError } from '../util/errors'

export function beerController (router: Router): void {
  router.post('/api/v1/beer',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request

      const createBeerRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await beerService.createBeer(trx, createBeerRequest)
      })

      ctx.status = 201
      ctx.body = {
        beer: result
      }
    }
  )

  router.put('/api/v1/beer/:beerId',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request
      const { beerId } = ctx.params

      const updateBeerRequest = validateUpdateRequest(body, beerId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await beerService.updateBeer(trx, beerId, updateBeerRequest)
      })

      ctx.status = 200
      ctx.body = {
        beer: result
      }
    }
  )

  router.get(
    '/api/v1/beer/:beerId',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { beerId } = ctx.params
      const beer = await beerService.findBeerById(ctx.db, beerId)

      if (beer == null) {
        throw new ControllerError(
          404,
          'BeerNotFound',
          `beer with id ${beerId} was not found`
        )
      }

      ctx.body = { beer }
    }
  )

  router.get(
    '/api/v1/beer',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const beers = await beerService.listBeers(ctx.db)
      ctx.body = { beers }
    }
  )
}

function validateCreateRequest (body: unknown): CreateBeerRequest {
  if (!validateCreateBeerRequest(body)) {
    throw new ControllerError(400, 'InvalidBeer', 'invalid beer')
  }

  const result = body as CreateBeerRequest
  return result
}

function validateUpdateRequest (body: unknown, beerId: string): UpdateBeerRequest {
  if (!validateUpdateBeerRequest(body)) {
    throw new ControllerError(400, 'InvalidBeer', 'invalid beer')
  }
  if (typeof beerId !== 'string' || beerId.length === 0) {
    throw new ControllerError(400, 'InvalidBeerId', 'invalid beer id')
  }

  const result = body as UpdateBeerRequest
  return result
}
