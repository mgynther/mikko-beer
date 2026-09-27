import type {
  AnnualContainerStatsBody,
  AnnualStatsBody,
  BreweryCountryStatsBody,
  BreweryStatsBody,
  ContainerStatsBody,
  LocationStatsBody,
  OverallStatsBody,
  RatingStatsBody,
  StatsFilterQuery,
  StatsHandlers,
  StatsIdFilterQuery,
  StatsOrderQuery,
  StyleStatsBody,
} from '../../stats/stats.js'
import type { PaginationQuery } from '../../pagination.js'
import type { RouteRequest, Router } from '../router.js'

export function statsRoutes(router: Router, stats: StatsHandlers): void {
  router.get(
    '/api/v1/stats/overall',
    200,
    async (request: RouteRequest): Promise<OverallStatsBody> =>
      await stats.getOverall({
        authorization: request.authorization,
        filter: statsIdFilterQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/annual',
    200,
    async (request: RouteRequest): Promise<AnnualStatsBody> =>
      await stats.getAnnual({
        authorization: request.authorization,
        filter: statsIdFilterQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/annual_container',
    200,
    async (request: RouteRequest): Promise<AnnualContainerStatsBody> =>
      await stats.getAnnualContainer({
        authorization: request.authorization,
        pagination: paginationQuery(request),
        filter: statsIdFilterQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/brewery',
    200,
    async (request: RouteRequest): Promise<BreweryStatsBody> =>
      await stats.getBrewery({
        authorization: request.authorization,
        pagination: paginationQuery(request),
        filter: statsFilterQuery(request),
        order: statsOrderQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/brewery_country',
    200,
    async (request: RouteRequest): Promise<BreweryCountryStatsBody> =>
      await stats.getBreweryCountry({
        authorization: request.authorization,
        pagination: paginationQuery(request),
        filter: statsFilterQuery(request),
        order: statsOrderQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/container',
    200,
    async (request: RouteRequest): Promise<ContainerStatsBody> =>
      await stats.getContainer({
        authorization: request.authorization,
        filter: statsIdFilterQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/location',
    200,
    async (request: RouteRequest): Promise<LocationStatsBody> =>
      await stats.getLocation({
        authorization: request.authorization,
        pagination: paginationQuery(request),
        filter: statsFilterQuery(request),
        order: statsOrderQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/rating',
    200,
    async (request: RouteRequest): Promise<RatingStatsBody> =>
      await stats.getRating({
        authorization: request.authorization,
        filter: statsIdFilterQuery(request),
      }),
  )

  router.get(
    '/api/v1/stats/style',
    200,
    async (request: RouteRequest): Promise<StyleStatsBody> =>
      await stats.getStyle({
        authorization: request.authorization,
        filter: statsFilterQuery(request),
        order: statsOrderQuery(request),
      }),
  )
}

function paginationQuery(request: RouteRequest): PaginationQuery {
  return {
    size: request.query.size,
    skip: request.query.skip,
  }
}

function statsIdFilterQuery(request: RouteRequest): StatsIdFilterQuery {
  return {
    brewery: request.query.brewery,
    location: request.query.location,
    style: request.query.style,
  }
}

function statsFilterQuery(request: RouteRequest): StatsFilterQuery {
  return {
    ...statsIdFilterQuery(request),
    minReviewCount: request.query.min_review_count,
    maxReviewCount: request.query.max_review_count,
    minReviewAverage: request.query.min_review_average,
    maxReviewAverage: request.query.max_review_average,
    timeStart: request.query.time_start,
    timeEnd: request.query.time_end,
  }
}

function statsOrderQuery(request: RouteRequest): StatsOrderQuery {
  return {
    order: request.query.order,
    direction: request.query.direction,
  }
}
