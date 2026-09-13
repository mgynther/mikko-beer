import * as locationService from '../../logic/location/authorized.service.js'
import type { Pagination } from '../../logic/pagination.js'
import type { SearchByName } from '../../logic/search.js'
import { validateSearchByName } from '../../validation/search.js'

import * as locationRepository from '../../data/location/location.repository.js'

import * as authHelper from '../authentication/authentication-helper.js'

import type { Router } from '../router.js'
import type {
  Location,
  CreateLocationRequest,
} from '../../logic/location/location.js'
import { validatePagination } from '../pagination-helper.js'
import type { Context } from '../context.js'
import {
  validateLocationId,
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from '../../validation/location.js'

export interface CreatedOrUpdatedLocation {
  id: string
  name: string
}

interface CreateResult {
  status: 201
  body: {
    location: CreatedOrUpdatedLocation
  }
}

interface UpdateResult {
  status: 200
  body: {
    location: CreatedOrUpdatedLocation
  }
}

export interface ReadLocation {
  id: string
  name: string
}

interface ReadResult {
  status: 200
  body: {
    location: ReadLocation
  }
}

interface ListResult {
  status: 200
  body: {
    locations: Array<ReadLocation>
    pagination: {
      size: number
      skip: number
    }
  }
}

interface SearchResult {
  status: 200
  body: {
    locations: Array<ReadLocation>
  }
}

export function locationController(router: Router): void {
  router.post(
    '/api/v1/location',
    async (ctx: Context): Promise<CreateResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<Location> =>
          await locationService.createLocation(
            async (location: CreateLocationRequest): Promise<Location> =>
              await locationRepository.insertLocation(trx, location),
            validateCreateLocationRequest,
            {
              authTokenPayload,
              body,
            },
            ctx.log,
          ),
      )

      return {
        status: 201,
        body: {
          location: result,
        },
      }
    },
  )

  router.put(
    '/api/v1/location/:locationId',
    async (ctx: Context): Promise<UpdateResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const locationId: string | undefined = ctx.params.locationId

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<Location> =>
          await locationService.updateLocation(
            async (location: Location): Promise<Location> =>
              await locationRepository.updateLocation(trx, location),
            validateUpdateLocationRequest,
            locationId,
            {
              authTokenPayload,
              body,
            },
            ctx.log,
          ),
      )

      return {
        status: 200,
        body: {
          location: result,
        },
      }
    },
  )

  router.get(
    '/api/v1/location/:locationId',
    async (ctx: Context): Promise<ReadResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const locationId: string | undefined = ctx.params.locationId
      const location = await locationService.findLocationById(
        async (locationId: string): Promise<Location | undefined> =>
          await locationRepository.findLocationById(ctx.db, locationId),
        validateLocationId,
        {
          authTokenPayload,
          id: locationId,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { location },
      }
    },
  )

  router.get('/api/v1/location', async (ctx: Context): Promise<ListResult> => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const { skip, size } = ctx.request.query
    const pagination = validatePagination({ skip, size })
    const locations = await locationService.listLocations(
      async (pagination: Pagination): Promise<Location[]> =>
        await locationRepository.listLocations(ctx.db, pagination),
      {
        authTokenPayload,
        pagination,
      },
      ctx.log,
    )
    return {
      status: 200,
      body: { locations, pagination },
    }
  })

  router.post(
    '/api/v1/location/search',
    async (ctx: Context): Promise<SearchResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const locations = await locationService.searchLocations(
        async (searchRequest: SearchByName): Promise<Location[]> =>
          await locationRepository.searchLocations(ctx.db, searchRequest),
        validateSearchByName,
        {
          authTokenPayload,
          body,
        },
        ctx.log,
      )

      return {
        status: 200,
        body: { locations },
      }
    },
  )
}
