import * as statsService from '../../core/stats/authorized.service'

import * as statsRepository from '../../data/stats/stats.repository'

import type { Pagination } from '../../core/pagination'
import type { Router } from '../router'

import { validatePagination} from '../../core/pagination'

import type {
  BreweryStatsOrder,
  StyleStatsOrder,
  StatsBreweryStyleFilter,
  StatsFilter,
} from '../../core/stats/stats'
import {
  validateBreweryStatsOrder,
  validateStyleStatsOrder,
  validateStatsBreweryStyleFilter,
  validateStatsFilter
} from '../../core/stats/stats'
import { parseAuthToken } from '../authentication/authentication-helper'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats/overall',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const overall = await statsService.getOverall(
        async (
          statsFilter: StatsBreweryStyleFilter
        ) => await statsRepository.getOverall(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      ctx.body = { overall }
    }
  )
  router.get(
    '/api/v1/stats/annual',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const annual = await statsService.getAnnual(
        async (
          statsFilter: StatsBreweryStyleFilter
        ) => await statsRepository.getAnnual(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      ctx.body = { annual }
    }
  )
  router.get(
    '/api/v1/stats/brewery',
    async (ctx) => {
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
      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/stats/rating',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const rating = await statsService.getRating(
        async (
          statsFilter: StatsBreweryStyleFilter
        ) => await statsRepository.getRating(
          ctx.db,
          statsFilter
        ),
        authTokenPayload,
        statsFilter,
        ctx.log
      )
      ctx.body = { rating }
    }
  )

  router.get(
    '/api/v1/stats/style',
    async (ctx) => {
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
      ctx.body = { style }
    }
  )
}
