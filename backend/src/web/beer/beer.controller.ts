import * as beerRepository from '../../data/beer/beer.repository'
import * as breweryRepository from '../../data/brewery/brewery.repository'
import { type Transaction } from '../../data/database'
import * as beerService from '../../core/beer/beer.service'
import {
  type CreateIf,
  type UpdateIf,
  BreweryNotFoundError,
  StyleNotFoundError
} from '../../core/beer/beer.service'
import { type Pagination } from '../../core/pagination'
import { type SearchByName } from '../../core/search'
import * as styleRepository from '../../data/style/style.repository'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import {
  type Beer,
  type CreateBeerRequest,
  type NewBeer,
  type UpdateBeerRequest,
  validateCreateBeerRequest,
  validateUpdateBeerRequest
} from '../../core/beer/beer'
import { ControllerError } from '../../core/errors'
import { validatePagination } from '../pagination'
import { validateSearchByName } from '../search'

function handleError (e: unknown): void {
  if (e instanceof BreweryNotFoundError) {
    throw new ControllerError(
      400,
      'BreweryNotFound',
      'brewery not found'
    )
  }
  if (e instanceof StyleNotFoundError) {
    throw new ControllerError(
      400,
      'StyleNotFound',
      'style not found'
    )
  }
  throw e
}

export function beerController (router: Router): void {
  router.post('/api/v1/beer',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      try {
        const createBeerRequest = validateCreateRequest(body)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const createIf: CreateIf = {
            create: (beer: NewBeer) => beerRepository.insertBeer(trx, beer),
            lockBreweries: createBreweryLocker(trx),
            lockStyles: createStyleLocker(trx),
            insertBeerBreweries: createBeerBreweryInserter(trx),
            insertBeerStyles: createBeerStyleInserter(trx),
          }
          return await beerService.createBeer(
            createIf,
            createBeerRequest,
            ctx.log
          )
        })

        ctx.status = 201
        ctx.body = {
          beer: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.put('/api/v1/beer/:beerId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { beerId } = ctx.params

      try {
        const updateBeerRequest = validateUpdateRequest(body, beerId)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const updateIf: UpdateIf = {
            update: (beer: Beer) => beerRepository.updateBeer(trx, beer),
            lockBreweries: createBreweryLocker(trx),
            lockStyles: createStyleLocker(trx),
            insertBeerBreweries: createBeerBreweryInserter(trx),
            deleteBeerBreweries: (
              beerId: string
            ) => beerRepository.deleteBeerBreweries(trx, beerId),
            insertBeerStyles: createBeerStyleInserter(trx),
            deleteBeerStyles: (
              beerId: string
            ) => beerRepository.deleteBeerStyles(trx, beerId),
          }
          return await beerService.updateBeer(
            updateIf,
            beerId,
            updateBeerRequest,
            ctx.log
          )
        })

        ctx.status = 200
        ctx.body = {
          beer: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.get(
    '/api/v1/beer/:beerId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { beerId } = ctx.params
      const beer = await beerService.findBeerById((beerId: string) => {
        return beerRepository.findBeerById(ctx.db, beerId)
      }, beerId, ctx.log)

      if (beer === undefined) {
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
    authHelper.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const beers = await beerService.listBeers((pagination: Pagination) => {
        return beerRepository.listBeers(ctx.db, pagination)
      }, pagination, ctx.log)
      ctx.body = { beers, pagination }
    }
  )

  router.post('/api/v1/beer/search',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { body } = ctx.request

      const searchBeerRequest = validateSearchByName(body)
      const beers = await beerService.searchBeers((searchRequest: SearchByName) => {
        return beerRepository.searchBeers(ctx.db, searchRequest)
      }, searchBeerRequest, ctx.log)

      ctx.status = 200
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

function validateUpdateRequest (
  body: unknown,
  beerId: string
): UpdateBeerRequest {
  if (!validateUpdateBeerRequest(body)) {
    throw new ControllerError(400, 'InvalidBeer', 'invalid beer')
  }
  if (typeof beerId !== 'string' || beerId.length === 0) {
    throw new ControllerError(400, 'InvalidBeerId', 'invalid beer id')
  }

  const result = body as UpdateBeerRequest
  return result
}

function createBeerBreweryInserter(trx: Transaction) {
  return (beerId: string, breweries: string[]) => {
    return beerRepository.insertBeerBreweries(trx, breweries.map(brewery => ({
      beer: beerId,
      brewery
    }))) as Promise<unknown> as Promise<void>
  }
}

function createBeerStyleInserter(trx: Transaction) {
  return (beerId: string, styles: string[]) => {
    return beerRepository.insertBeerStyles(trx, styles.map(style => ({
      beer: beerId,
      style
    }))) as Promise<unknown> as Promise<void>
  }
}

function createBreweryLocker(trx: Transaction) {
  return async function(styleIds: string[]): Promise<string[]> {
    return breweryRepository.lockBreweries(trx, styleIds)
  }
}

function createStyleLocker(trx: Transaction) {
  return async function(styleIds: string[]): Promise<string[]> {
    return styleRepository.lockStyles(trx, styleIds)
  }
}
