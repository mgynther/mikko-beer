import * as statsService from './stats.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'

import { validatePagination } from '../util/pagination'

import { validateStatsFilter } from './stats'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats/overall',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsFilter(ctx.request.query)
      const overall = await statsService.getOverall(ctx.db, statsFilter)
      ctx.body = { overall }
    }
  )
  router.get(
    '/api/v1/stats/annual',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsFilter(ctx.request.query)
      const annual = await statsService.getAnnual(ctx.db, statsFilter)
      ctx.body = { annual }
    }
  )
  router.get(
    '/api/v1/stats/brewery',
    authService.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const pagination = validatePagination({ skip, size })
      const statsFilter = validateStatsFilter(ctx.request.query)
      const brewery =
        await statsService.getBrewery(ctx.db, pagination, statsFilter)
      ctx.body = { brewery }
    }
  )

  router.get(
    '/api/v1/stats/rating',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsFilter(ctx.request.query)
      const rating = await statsService.getRating(ctx.db, statsFilter)
      ctx.body = { rating }
    }
  )

  router.get(
    '/api/v1/stats/style',
    authService.authenticateViewer,
    async (ctx) => {
      const statsFilter = validateStatsFilter(ctx.request.query)
      const style = await statsService.getStyle(ctx.db, statsFilter)
      ctx.body = { style }
    }
  )
}
