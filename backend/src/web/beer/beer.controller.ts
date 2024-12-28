import * as beerRepository from '../../data/beer/beer.repository'
import * as breweryRepository from '../../data/brewery/brewery.repository'
import type { Transaction } from '../../data/database'
import * as beerService from '../../core/beer.authorized.service'
import type { Pagination } from '../../core/pagination'
import type { SearchByName } from '../../core/search'
import * as styleRepository from '../../data/style/style.repository'
import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type { Beer, CreateIf, NewBeer, UpdateIf } from '../../core/beer'
import { validatePagination } from '../../core/pagination'
import { validateSearchByName } from '../../core/search'

export function beerController (router: Router): void {
  router.post('/api/v1/beer',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

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
          {
            authTokenPayload,
            body
          },
          ctx.log
        )
      })

      ctx.status = 201
      ctx.body = {
        beer: result
      }
    }
  )

  router.put('/api/v1/beer/:beerId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request
      const beerId: string | undefined = ctx.params.beerId

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
          {
            authTokenPayload,
            body
          },
          ctx.log
        )
      })

      ctx.status = 200
      ctx.body = {
        beer: result
      }
    }
  )

  router.get(
    '/api/v1/beer/:beerId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const beerId: string | undefined = ctx.params.beerId
      const beer = await beerService.findBeerById((beerId: string) => {
        return beerRepository.findBeerById(ctx.db, beerId)
      }, {
        authTokenPayload,
        id: beerId
      }, ctx.log)

      ctx.body = { beer }
    }
  )

  router.get(
    '/api/v1/beer',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const beers = await beerService.listBeers((pagination: Pagination) => {
        return beerRepository.listBeers(ctx.db, pagination)
      }, {
        authTokenPayload,
        pagination
      }, ctx.log)
      ctx.body = { beers, pagination }
    }
  )

  router.post('/api/v1/beer/search',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const searchByName = validateSearchByName(body)
      const beers = await beerService.searchBeers((searchRequest: SearchByName) => {
        return beerRepository.searchBeers(ctx.db, searchRequest)
      }, {
        authTokenPayload,
        searchByName
      }, ctx.log)

      ctx.status = 200
      ctx.body = { beers }
    }
  )
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
