import * as beerService from '../../logic/beer/authorized.service.js'
import type {
  Beer,
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  NewBeer,
  UpdateIf,
} from '../../logic/beer/beer.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'
import type { SearchByName } from '../../logic/search.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as breweryRepository from '../../data/brewery/brewery.repository.js'
import type {
  InsertableBeerBreweryRow,
  InsertableBeerStyleRow,
} from '../../data/beer/beer.table.js'
import type { Transaction } from '../../data/database.js'
import * as styleRepository from '../../data/style/style.repository.js'

import {
  validateBeerId,
  validateCreateBeerRequest,
  validateUpdateBeerRequest,
} from '../../validation/beer.js'
import { validatePagination } from '../../validation/pagination.js'
import { validateSearchByName } from '../../validation/search.js'

import type {
  BeerBody,
  BeerHandlers,
  BeerListBody,
  BeerSearchBody,
  ReadBeerBody,
} from '../../web/beer/beer.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createBeerHandlers(context: Context): BeerHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<BeerBody> => {
        const beer = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<BeerWithBreweryAndStyleIds> => {
            const createIf: CreateIf = {
              create: async (beer: NewBeer): Promise<Beer> =>
                await beerRepository.insertBeer(trx, beer),
              lockBreweries: createBreweryLocker(trx),
              lockStyles: createStyleLocker(trx),
              insertBeerBreweries: createBeerBreweryInserter(trx),
              insertBeerStyles: createBeerStyleInserter(trx),
            }
            return await beerService.createBeer(
              createIf,
              validateCreateBeerRequest,
              { authTokenPayload, body: request.body },
              log,
            )
          },
        )
        return { beer }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<BeerBody> => {
        const beer = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<BeerWithBreweryAndStyleIds> => {
            const updateIf: UpdateIf = {
              update: async (beer: Beer): Promise<Beer> =>
                await beerRepository.updateBeer(trx, beer),
              lockBreweries: createBreweryLocker(trx),
              lockStyles: createStyleLocker(trx),
              insertBeerBreweries: createBeerBreweryInserter(trx),
              deleteBeerBreweries: async (beerId: string): Promise<void> => {
                await beerRepository.deleteBeerBreweries(trx, beerId)
              },
              insertBeerStyles: createBeerStyleInserter(trx),
              deleteBeerStyles: async (beerId: string): Promise<void> => {
                await beerRepository.deleteBeerStyles(trx, beerId)
              },
            }
            return await beerService.updateBeer(
              updateIf,
              validateUpdateBeerRequest,
              request.id,
              { authTokenPayload, body: request.body },
              log,
            )
          },
        )
        return { beer }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadBeerBody> => {
        const beer = await beerService.findBeerById(
          async (
            beerId: string,
          ): Promise<BeerWithBreweriesAndStyles | undefined> =>
            await beerRepository.findBeerById(db, beerId),
          validateBeerId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { beer }
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginationRequest,
      ): Promise<BeerListBody> => {
        const { beers, pagination } = await beerService.listBeers(
          async (
            pagination: Pagination,
          ): Promise<BeerWithBreweriesAndStyles[]> =>
            await beerRepository.listBeers(db, pagination),
          validatePagination,
          { authTokenPayload, pagination: request.pagination },
          log,
        )
        return { beers, pagination }
      },
    ),

    search: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<BeerSearchBody> => {
        const beers = await beerService.searchBeers(
          async (
            searchRequest: SearchByName,
          ): Promise<BeerWithBreweriesAndStyles[]> =>
            await beerRepository.searchBeers(db, searchRequest),
          validateSearchByName,
          { authTokenPayload, body: request.body },
          log,
        )
        return { beers }
      },
    ),
  }
}

function createBeerBreweryInserter(
  trx: Transaction,
): (beerId: string, breweries: string[]) => Promise<void> {
  return async (beerId: string, breweries: string[]): Promise<void> => {
    await beerRepository.insertBeerBreweries(
      trx,
      breweries.map((brewery): InsertableBeerBreweryRow => ({
        beer: beerId,
        brewery,
      })),
    )
  }
}

function createBeerStyleInserter(
  trx: Transaction,
): (beerId: string, breweries: string[]) => Promise<void> {
  return async (beerId: string, styles: string[]): Promise<void> => {
    await beerRepository.insertBeerStyles(
      trx,
      styles.map((style): InsertableBeerStyleRow => ({
        beer: beerId,
        style,
      })),
    )
  }
}

function createBreweryLocker(
  trx: Transaction,
): (styleIds: string[]) => Promise<string[]> {
  return async function (styleIds: string[]): Promise<string[]> {
    return await breweryRepository.lockBreweries(trx, styleIds)
  }
}

function createStyleLocker(
  trx: Transaction,
): (styleIds: string[]) => Promise<string[]> {
  return async function (styleIds: string[]): Promise<string[]> {
    return await styleRepository.lockStyles(trx, styleIds)
  }
}
