import * as breweryService from '../../logic/brewery/authorized.service.js'
import type {
  Brewery,
  CreateBreweryRequest,
} from '../../logic/brewery/brewery.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'
import type { SearchByName } from '../../logic/search.js'

import * as breweryRepository from '../../data/brewery/brewery.repository.js'
import type { Transaction } from '../../data/database.js'

import {
  validateBreweryId,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest,
} from '../../validation/brewery.js'
import { validatePagination } from '../../validation/pagination.js'
import { validateSearchByName } from '../../validation/search.js'

import type {
  BreweryBody,
  BreweryHandlers,
  BreweryListBody,
  BrewerySearchBody,
  ReadBreweryBody,
} from '../../web/brewery/brewery.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createBreweryHandlers(context: Context): BreweryHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<BreweryBody> => {
        const brewery = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Brewery> =>
            await breweryService.createBrewery(
              async (brewery: CreateBreweryRequest): Promise<Brewery> =>
                await breweryRepository.insertBrewery(trx, brewery),
              validateCreateBreweryRequest,
              { authTokenPayload, body: request.body },
              log,
            ),
        )
        return { brewery }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<BreweryBody> => {
        const brewery = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Brewery> =>
            await breweryService.updateBrewery(
              async (brewery: Brewery): Promise<Brewery | undefined> =>
                await breweryRepository.updateBrewery(trx, brewery),
              validateUpdateBreweryRequest,
              request.id,
              { authTokenPayload, body: request.body },
              log,
            ),
        )
        return { brewery }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadBreweryBody> => {
        const brewery = await breweryService.findBreweryById(
          async (breweryId: string): Promise<Brewery | undefined> =>
            await breweryRepository.findBreweryById(db, breweryId),
          validateBreweryId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { brewery }
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginationRequest,
      ): Promise<BreweryListBody> => {
        const { breweries, pagination } = await breweryService.listBreweries(
          async (pagination: Pagination): Promise<Brewery[]> =>
            await breweryRepository.listBreweries(db, pagination),
          validatePagination,
          { authTokenPayload, pagination: request.pagination },
          log,
        )
        return { breweries, pagination }
      },
    ),

    search: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<BrewerySearchBody> => {
        const breweries = await breweryService.searchBreweries(
          async (searchRequest: SearchByName): Promise<Brewery[]> =>
            await breweryRepository.searchBreweries(db, searchRequest),
          validateSearchByName,
          { authTokenPayload, body: request.body },
          log,
        )
        return { breweries }
      },
    ),
  }
}
