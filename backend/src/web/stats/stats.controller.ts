import * as statsRepository from '../../data/stats/stats.repository'
import * as statsService from '../../core/stats/stats.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Pagination } from '../../core/pagination'
import {
  invalidBreweryAndStyleFilterError,
  invalidBreweryStatsQueryError,
  invalidStyleStatsQueryError
} from '../../core/errors'
import { type Router } from '../router'

import { validatePagination} from '../pagination'

import {
  type BreweryStatsOrder,
  validBreweryStatsOrder,
  type StyleStatsOrder,
  validStyleStatsOrder,
  type StatsBreweryStyleFilter,
  type StatsFilter,
  validStatsBreweryStyleFilter,
  validateStatsFilter
} from '../../core/stats/stats'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats/overall',
    authHelper.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const overall = await statsService.getOverall((
        statsFilter: StatsBreweryStyleFilter
      ) => {
        return statsRepository.getOverall(ctx.db, statsFilter)
      }, statsFilter, ctx.log)
      ctx.body = { overall }
    }
  )
  router.get(
    '/api/v1/stats/annual',
    authHelper.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const annual = await statsService.getAnnual((
        statsFilter: StatsBreweryStyleFilter
      ) => {
        return statsRepository.getAnnual(ctx.db, statsFilter)
      }, statsFilter, ctx.log)
      ctx.body = { annual }
    }
  )
  router.get(
    '/api/v1/stats/brewery',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const { order, direction } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const breweryStatsOrder = validateBreweryStatsOrder({ order, direction })
      const brewery =
        await statsService.getBrewery(
          (
            pagination: Pagination,
            statsFilter: StatsFilter,
            breweryStatsOrder: BreweryStatsOrder
          ) => {
            return statsRepository.getBrewery(
              ctx.db, pagination, statsFilter, breweryStatsOrder
            )
          },
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
    authHelper.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const rating = await statsService.getRating((
        statsFilter: StatsBreweryStyleFilter
      ) => {
        return statsRepository.getRating(ctx.db, statsFilter)
      }, statsFilter, ctx.log)
      ctx.body = { rating }
    }
  )

  router.get(
    '/api/v1/stats/style',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { order, direction } = ctx.request.query
      const styleStatsOrder = validateStyleStatsOrder({ order, direction })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const style = await statsService.getStyle((
        statsFilter: StatsFilter,
        styleStatsOrder: StyleStatsOrder
      ) => {
        return statsRepository.getStyle(
          ctx.db,
          statsFilter,
          styleStatsOrder
        )}, statsFilter, styleStatsOrder, ctx.log)
      ctx.body = { style }
    }
  )
}

function validateBreweryStatsOrder (
  query: Record<string, unknown>
): BreweryStatsOrder {
  const breweryStatsOrder = validBreweryStatsOrder(query)
  if (breweryStatsOrder === undefined) {
    throw invalidBreweryStatsQueryError
  }
  return breweryStatsOrder
}

function validateStyleStatsOrder (
  query: Record<string, unknown>
): StyleStatsOrder {
  const styleStatsOrder = validStyleStatsOrder(query)
  if (styleStatsOrder === undefined) {
    throw invalidStyleStatsQueryError
  }
  return styleStatsOrder
}

function validateStatsBreweryStyleFilter (
  query: Record<string, unknown>
): StatsBreweryStyleFilter {
  const styleStatsOrder = validStatsBreweryStyleFilter(query)
  if (styleStatsOrder === undefined) {
    throw invalidBreweryAndStyleFilterError
  }
  return styleStatsOrder
}
