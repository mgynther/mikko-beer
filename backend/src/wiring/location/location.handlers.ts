import * as locationService from '../../logic/location/authorized.service.js'
import type {
  Location,
  CreateLocationRequest,
} from '../../logic/location/location.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'
import type { SearchByName } from '../../logic/search.js'

import * as locationRepository from '../../data/location/location.repository.js'
import type { Transaction } from '../../data/database.js'

import {
  validateLocationId,
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from '../../validation/location.js'
import { validatePagination } from '../../validation/pagination.js'
import { validateSearchByName } from '../../validation/search.js'

import type {
  LocationBody,
  LocationHandlers,
  LocationListBody,
  LocationSearchBody,
  ReadLocationBody,
} from '../../web/location/location.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createLocationHandlers(context: Context): LocationHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<LocationBody> => {
        const location = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Location> =>
            await locationService.createLocation(
              async (location: CreateLocationRequest): Promise<Location> =>
                await locationRepository.insertLocation(trx, location),
              validateCreateLocationRequest,
              { authTokenPayload, body: request.body },
              log,
            ),
        )
        return { location }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<LocationBody> => {
        const location = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Location> =>
            await locationService.updateLocation(
              async (location: Location): Promise<Location> =>
                await locationRepository.updateLocation(trx, location),
              validateUpdateLocationRequest,
              request.id,
              { authTokenPayload, body: request.body },
              log,
            ),
        )
        return { location }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadLocationBody> => {
        const location = await locationService.findLocationById(
          async (locationId: string): Promise<Location | undefined> =>
            await locationRepository.findLocationById(db, locationId),
          validateLocationId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { location }
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginationRequest,
      ): Promise<LocationListBody> => {
        const { locations, pagination } = await locationService.listLocations(
          async (pagination: Pagination): Promise<Location[]> =>
            await locationRepository.listLocations(db, pagination),
          validatePagination,
          { authTokenPayload, pagination: request.pagination },
          log,
        )
        return { locations, pagination }
      },
    ),

    search: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<LocationSearchBody> => {
        const locations = await locationService.searchLocations(
          async (searchRequest: SearchByName): Promise<Location[]> =>
            await locationRepository.searchLocations(db, searchRequest),
          validateSearchByName,
          { authTokenPayload, body: request.body },
          log,
        )
        return { locations }
      },
    ),
  }
}
