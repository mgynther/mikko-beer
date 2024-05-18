import * as statsService from './stats.service'
import * as authService from '../authentication/authentication.service'

import { ControllerError } from '../errors'
import { type Router } from '../router'

import { validatePagination } from '../pagination'

import {
  type BreweryStatsOrder,
  validBreweryStatsOrder,
  type StyleStatsOrder,
  validStyleStatsOrder,
  type StatsBreweryStyleFilter,
  validStatsBreweryStyleFilter,
  validateStatsFilter
} from '../../core/stats/stats'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats/overall',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const overall = await statsService.getOverall(ctx.db, statsFilter)
      ctx.body = { overall }
    }
  )
  router.get(
    '/api/v1/stats/annual',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const annual = await statsService.getAnnual(ctx.db, statsFilter)
      ctx.body = { annual }
    }
  )
  router.get(
    '/api/v1/stats/brewery',
    authService.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const { order, direction } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const breweryStatsOrder = validateBreweryStatsOrder({ order, direction })
      const brewery =
        await statsService.getBrewery(
          ctx.db,
          pagination,
          statsFilter,
          breweryStatsOrder
        )
      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/stats/rating',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsBreweryStyleFilter(ctx.request.query)
      const rating = await statsService.getRating(ctx.db, statsFilter)
      ctx.body = { rating }
    }
  )

  router.get(
    '/api/v1/stats/style',
    authService.authenticateViewer,
    async (ctx) => {
      const { order, direction } = ctx.request.query
      const styleStatsOrder = validateStyleStatsOrder({ order, direction })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const style =
        await statsService.getStyle(
          ctx.db,
          statsFilter,
          styleStatsOrder
        )
      ctx.body = { style }
    }
  )
}

function validateBreweryStatsOrder (
  query: Record<string, unknown>
): BreweryStatsOrder {
  const breweryStatsOrder = validBreweryStatsOrder(query)
  if (breweryStatsOrder === undefined) {
    throw new ControllerError(
      400, 'InvalidBreweryStatsQuery', 'invalid brewery stats query')
  }
  return breweryStatsOrder
}

function validateStyleStatsOrder (
  query: Record<string, unknown>
): StyleStatsOrder {
  const styleStatsOrder = validStyleStatsOrder(query)
  if (styleStatsOrder === undefined) {
    throw new ControllerError(
      400, 'InvalidStyleStatsQuery', 'invalid style stats query')
  }
  return styleStatsOrder
}

function validateStatsBreweryStyleFilter (
  query: Record<string, unknown>
): StatsBreweryStyleFilter {
  const styleStatsOrder = validStatsBreweryStyleFilter(query)
  if (styleStatsOrder === undefined) {
    throw new ControllerError(
      400,
      'InvalidStatsBreweryAndStyleFilter',
      'invalid filter with both brewery and style'
    )
  }
  return styleStatsOrder
}
