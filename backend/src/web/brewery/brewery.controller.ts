import * as breweryRepository from '../../data/brewery/brewery.repository'
import * as breweryService from '../../core/brewery.authorized.service'
import type { Pagination } from '../../core/pagination'
import type { SearchByName } from '../../core/search'
import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type { Brewery, NewBrewery } from '../../core/brewery'
import { validatePagination } from '../../core/pagination'

export function breweryController (router: Router): void {
  router.post('/api/v1/brewery',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.createBrewery(
          (
            brewery: NewBrewery
          ) => breweryRepository.insertBrewery(trx, brewery),
          {
            authTokenPayload,
            body
          }, ctx.log)
      })

      ctx.status = 201
      ctx.body = {
        brewery: result
      }
    }
  )

  router.put('/api/v1/brewery/:breweryId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request
      const breweryId: string | undefined = ctx.params.breweryId

      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.updateBrewery(
          (brewery: Brewery) =>
            breweryRepository.updateBrewery(trx, brewery),
            breweryId, {
              authTokenPayload,
              body
            }, ctx.log)
      })

      ctx.status = 200
      ctx.body = {
        brewery: result
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const breweryId: string | undefined = ctx.params.breweryId
      const brewery = await breweryService.findBreweryById((breweryId: string) => {
        return breweryRepository.findBreweryById(ctx.db, breweryId)
      }, {
        authTokenPayload,
        id: breweryId
      }, ctx.log)

      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/brewery',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const breweries = await breweryService.listBreweries((pagination: Pagination) => {
        return breweryRepository.listBreweries(ctx.db, pagination)
      }, {
        authTokenPayload,
        pagination
      }, ctx.log)
      ctx.body = { breweries, pagination }
    }
  )

  router.post('/api/v1/brewery/search',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const breweries = await breweryService.searchBreweries((searchRequest: SearchByName) => {
        return breweryRepository.searchBreweries(ctx.db, searchRequest)
      }, {
        authTokenPayload,
        body
      }, ctx.log)

      ctx.status = 200
      ctx.body = { breweries }
    }
  )
}
