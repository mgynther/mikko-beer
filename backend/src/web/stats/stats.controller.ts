import * as statsService from '../../core/stats/authorized.service'

import * as statsRepository from '../../data/stats/stats.repository'

import type { Pagination } from '../../core/pagination'
import type { Router } from '../router'

import { validatePagination} from '../../core/pagination'

import type {
  BreweryStatsOrder,
  LocationStatsOrder,
  StyleStatsOrder,
  StatsIdFilter,
  StatsFilter,
} from '../../core/stats/stats'
import {
  validateBreweryStatsOrder,
  validateLocationStatsOrder,
  validateStyleStatsOrder,
  validateStatsIdFilter,
  validateStatsFilter
} from '../../core/stats/stats'
import { parseAuthToken } from '../authentication/authentication-helper'
import type { Context } from '../context'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats/overall',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsIdFilter(ctx.request.query)
      const overall = await statsService.getOverall(
        async (
          statsFilter: StatsIdFilter
        ) => await statsRepository.getOverall(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      return {
        status: 200,
        body: { overall }
      }
    }
  )
  router.get(
    '/api/v1/stats/annual',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsIdFilter(ctx.request.query)
      const annual = await statsService.getAnnual(
        async (
          statsFilter: StatsIdFilter
        ) => await statsRepository.getAnnual(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      return {
        status: 200,
        body: { annual }
      }
    }
  )
  router.get(
    '/api/v1/stats/annual_container',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const statsFilter = validateStatsIdFilter(ctx.request.query)
      const pagination = validatePagination({ skip, size })
      const annualContainer = await statsService.getAnnualContainer(
        async (
          pagination: Pagination,
          statsFilter: StatsIdFilter
        ) => await statsRepository.getAnnualContainer(
          ctx.db,
          pagination,
          statsFilter
        ),
        authTokenPayload,
        pagination,
        statsFilter,
        ctx.log
      )
      return {
        status: 200,
        body: { annualContainer }
      }
    }
  )
  router.get(
    '/api/v1/stats/brewery',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const { order, direction } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const breweryStatsOrder = validateBreweryStatsOrder({ order, direction })
      const brewery =
        await statsService.getBrewery(
          async (
            pagination: Pagination,
            statsFilter: StatsFilter,
            breweryStatsOrder: BreweryStatsOrder
          ) => await statsRepository.getBrewery(
              ctx.db, pagination, statsFilter, breweryStatsOrder
            ),
          authTokenPayload,
          pagination,
          statsFilter,
          breweryStatsOrder,
          ctx.log
        )
      return {
        status: 200,
        body: { brewery }
      }
    }
  )

  router.get(
    '/api/v1/stats/container',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsIdFilter(ctx.request.query)
      const container = await statsService.getContainer(
        async (
          statsFilter: StatsIdFilter
        ) => await statsRepository.getContainer(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      return {
        status: 200,
        body: { container }
      }
    }
  )

  router.get(
    '/api/v1/stats/location',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const { order, direction } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const locationStatsOrder =
        validateLocationStatsOrder({ order, direction })
      const location =
        await statsService.getLocation(
          async (
            pagination: Pagination,
            statsFilter: StatsFilter,
            locationStatsOrder: LocationStatsOrder
          ) => await statsRepository.getLocation(
              ctx.db, pagination, statsFilter, locationStatsOrder
            ),
          authTokenPayload,
          pagination,
          statsFilter,
          locationStatsOrder,
          ctx.log
        )
      return {
        status: 200,
        body: { location }
      }
    }
  )

  router.get(
    '/api/v1/stats/rating',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsIdFilter(ctx.request.query)
      const rating = await statsService.getRating(
        async (
          statsFilter: StatsIdFilter
        ) => await statsRepository.getRating(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      return {
        status: 200,
        body: { rating }
      }
    }
  )

  router.get(
    '/api/v1/stats/style',
    async (ctx: Context) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { order, direction } = ctx.request.query
      const styleStatsOrder = validateStyleStatsOrder({ order, direction })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const style = await statsService.getStyle(async (
        statsFilter: StatsFilter,
        styleStatsOrder: StyleStatsOrder
      ) => await statsRepository.getStyle(
          ctx.db,
          statsFilter,
          styleStatsOrder
        ), authTokenPayload, statsFilter, styleStatsOrder, ctx.log)
      return {
        status: 200,
        body: { style }
      }
    }
  )
}
