import * as locationService from '../../core/location/authorized.service'
import type { Pagination } from '../../core/pagination'
import type { SearchByName } from '../../core/search'

import * as locationRepository from '../../data/location/location.repository'

import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type {
  Location,
  CreateLocationRequest
} from '../../core/location/location'
import { validatePagination } from '../../core/pagination'

export function locationController (router: Router): void {
  router.post('/api/v1/location',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx) => await locationService.createLocation(
          async (
            location: CreateLocationRequest
          ) => await locationRepository.insertLocation(trx, location),
          {
            authTokenPayload,
            body
          },
          ctx.log
        )
      )

      ctx.status = 201
      ctx.body = {
        location: result
      }
    }
  )

  router.put('/api/v1/location/:locationId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const locationId: string | undefined = ctx.params.locationId

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx) => await locationService.updateLocation(
          async (location: Location) =>
            await locationRepository.updateLocation(trx, location),
          locationId,
          {
            authTokenPayload,
            body
          },
          ctx.log
        )
      )

      ctx.status = 200
      ctx.body = {
        location: result
      }
    }
  )

  router.get(
    '/api/v1/location/:locationId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const locationId: string | undefined = ctx.params.locationId
      const location = await locationService.findLocationById(
        async (locationId: string) =>
          await locationRepository.findLocationById(ctx.db, locationId),
        {
          authTokenPayload,
          id: locationId
        },
        ctx.log
      )

      ctx.body = { location }
    }
  )

  router.get(
    '/api/v1/location',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const locations = await locationService.listLocations(
        async (pagination: Pagination) =>
          await locationRepository.listLocations(ctx.db, pagination),
        {
          authTokenPayload,
          pagination
        },
        ctx.log
      )
      ctx.body = { locations, pagination }
    }
  )

  router.post('/api/v1/location/search',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const locations = await locationService.searchLocations(
        async (searchRequest: SearchByName) =>
          await locationRepository.searchLocations(ctx.db, searchRequest),
        {
          authTokenPayload,
          body
        },
        ctx.log
      )

      ctx.status = 200
      ctx.body = { locations }
    }
  )
}
