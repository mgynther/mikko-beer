import * as breweryRepository from '../../data/brewery/brewery.repository'
import * as breweryService from '../../core/brewery/brewery.service'
import { type Pagination } from '../../core/pagination'
import { type SearchByName } from '../../core/search'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import {
  type Brewery,
  type NewBrewery,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from '../../core/brewery/brewery'
import { validatePagination } from '../pagination'
import { validateSearchByName } from '../search'

export function breweryController (router: Router): void {
  router.post('/api/v1/brewery',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createBreweryRequest = validateCreateBreweryRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.createBrewery(
          (
            brewery: NewBrewery
          ) => breweryRepository.insertBrewery(trx, brewery),
          createBreweryRequest, ctx.log)
      })

      ctx.status = 201
      ctx.body = {
        brewery: result
      }
    }
  )

  router.put('/api/v1/brewery/:breweryId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { breweryId } = ctx.params

      const updateBreweryRequest = validateUpdateBreweryRequest(body, breweryId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await breweryService.updateBrewery(
          (brewery: Brewery) =>
            breweryRepository.updateBrewery(trx, brewery),
            breweryId, updateBreweryRequest, ctx.log)
      })

      ctx.status = 200
      ctx.body = {
        brewery: result
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const brewery = await breweryService.findBreweryById((breweryId: string) => {
        return breweryRepository.findBreweryById(ctx.db, breweryId)
      }, breweryId, ctx.log)

      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/brewery',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const breweries = await breweryService.listBreweries((pagination: Pagination) => {
        return breweryRepository.listBreweries(ctx.db, pagination)
      }, pagination, ctx.log)
      ctx.body = { breweries, pagination }
    }
  )

  router.post('/api/v1/brewery/search',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { body } = ctx.request

      const searchBreweryRequest = validateSearchByName(body)
      const breweries = await breweryService.searchBreweries((searchRequest: SearchByName) => {
        return breweryRepository.searchBreweries(ctx.db, searchRequest)
      }, searchBreweryRequest, ctx.log)

      ctx.status = 200
      ctx.body = { breweries }
    }
  )
}
