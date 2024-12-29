import * as beerRepository from '../../data/beer/beer.repository'
import * as breweryRepository from '../../data/brewery/brewery.repository'
import type { Transaction } from '../../data/database'
import * as beerService from '../../core/beer/authorized.service'
import type { Pagination } from '../../core/pagination'
import type { SearchByName } from '../../core/search'
import * as styleRepository from '../../data/style/style.repository'
import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type { Beer, CreateIf, NewBeer, UpdateIf } from '../../core/beer/beer'
import { validatePagination } from '../../core/pagination'
import { validateSearchByName } from '../../core/search'

export function beerController (router: Router): void {
  router.post('/api/v1/beer',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(async (trx) => {
        const createIf: CreateIf = {
          create: async (beer: NewBeer) =>
            await beerRepository.insertBeer(trx, beer),
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
          update: async (beer: Beer) =>
            await beerRepository.updateBeer(trx, beer),
          lockBreweries: createBreweryLocker(trx),
          lockStyles: createStyleLocker(trx),
          insertBeerBreweries: createBeerBreweryInserter(trx),
          deleteBeerBreweries: async (
            beerId: string
          ) => { await beerRepository.deleteBeerBreweries(trx, beerId); },
          insertBeerStyles: createBeerStyleInserter(trx),
          deleteBeerStyles: async (
            beerId: string
          ) => { await beerRepository.deleteBeerStyles(trx, beerId); },
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
      const beer = await beerService.findBeerById(
        async (beerId: string) =>
          await beerRepository.findBeerById(ctx.db, beerId),
        {
          authTokenPayload,
          id: beerId
        },
        ctx.log
      )

      ctx.body = { beer }
    }
  )

  router.get(
    '/api/v1/beer',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const beers = await beerService.listBeers(
        async (pagination: Pagination) =>
          await beerRepository.listBeers(ctx.db, pagination),
        {
          authTokenPayload,
          pagination
        },
        ctx.log
      )
      ctx.body = { beers, pagination }
    }
  )

  router.post('/api/v1/beer/search',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const searchByName = validateSearchByName(body)
      const beers = await beerService.searchBeers(
        async (searchRequest: SearchByName) =>
          await beerRepository.searchBeers(ctx.db, searchRequest),
        {
          authTokenPayload,
          searchByName
        },
        ctx.log
      )

      ctx.status = 200
      ctx.body = { beers }
    }
  )
}

function createBeerBreweryInserter(trx: Transaction): (
  beerId: string,
  breweries: string[]
) => Promise<void> {
  return async (beerId: string, breweries: string[]) => {
    await beerRepository.insertBeerBreweries(trx, breweries.map(brewery => ({
      beer: beerId,
      brewery
    })))
  }
}

function createBeerStyleInserter(trx: Transaction): (
  beerId: string,
  breweries: string[]
) => Promise<void>  {
  return async (beerId: string, styles: string[]) => {
    await beerRepository.insertBeerStyles(trx, styles.map(style => ({
      beer: beerId,
      style
    })))
  }
}

function createBreweryLocker(trx: Transaction): (
  styleIds: string[]
) => Promise<string[]> {
  return async function(styleIds: string[]): Promise<string[]> {
    return await breweryRepository.lockBreweries(trx, styleIds)
  }
}

function createStyleLocker(trx: Transaction): (
  styleIds: string[]
) => Promise<string[]>  {
  return async function(styleIds: string[]): Promise<string[]> {
    return await styleRepository.lockStyles(trx, styleIds)
  }
}
