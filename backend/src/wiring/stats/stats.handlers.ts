import * as statsService from '../../logic/stats/authorized.service.js'
import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryCountryStats,
  BreweryCountryStatsOrder,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  LocationStats,
  LocationStatsOrder,
  OrderedStatsQuery,
  OverallStats,
  RatingStats,
  StatsFilter,
  StatsIdFilter,
  StyleStats,
  StyleStatsOrder,
  ValidateAnnualContainerStats,
  ValidateBreweryCountryStats,
  ValidateBreweryStats,
  ValidateLocationStats,
  ValidateStyleStats,
} from '../../logic/stats/stats.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'

import * as annualStatsRepository from '../../data/stats/annual.repository.js'
import * as annualContainerStatsRepository from '../../data/stats/annual-container.repository.js'
import * as breweryStatsRepository from '../../data/stats/brewery.repository.js'
import * as breweryCountryStatsRepository from '../../data/stats/brewery-country.repository.js'
import * as containerStatsRepository from '../../data/stats/container.repository.js'
import * as locationStatsRepository from '../../data/stats/location.repository.js'
import * as overallStatsRepository from '../../data/stats/overall.repository.js'
import * as ratingStatsRepository from '../../data/stats/rating.repository.js'
import * as styleStatsRepository from '../../data/stats/style.repository.js'

import { validatePagination } from '../../validation/pagination.js'
import {
  validateBreweryCountryStatsOrder,
  validateBreweryStatsOrder,
  validateLocationStatsOrder,
  validateStatsFilter,
  validateStatsIdFilter,
  validateStyleStatsOrder,
} from '../../validation/stats.js'

import type {
  AnnualContainerStatsBody,
  AnnualStatsBody,
  BreweryCountryStatsBody,
  BreweryStatsBody,
  ContainerStatsBody,
  IdFilteredStatsRequest,
  LocationStatsBody,
  OrderedStatsRequest,
  OverallStatsBody,
  PaginatedIdFilteredStatsRequest,
  PaginatedOrderedStatsRequest,
  RatingStatsBody,
  StatsHandlers,
  StyleStatsBody,
} from '../../web/stats/stats.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

const validateAnnualContainerStats: ValidateAnnualContainerStats = {
  pagination: validatePagination,
  filter: validateStatsIdFilter,
}

const validateBreweryStats: ValidateBreweryStats = {
  pagination: validatePagination,
  filter: validateStatsFilter,
  order: validateBreweryStatsOrder,
}

const validateBreweryCountryStats: ValidateBreweryCountryStats = {
  pagination: validatePagination,
  filter: validateStatsFilter,
  order: validateBreweryCountryStatsOrder,
}

const validateLocationStats: ValidateLocationStats = {
  pagination: validatePagination,
  filter: validateStatsFilter,
  order: validateLocationStatsOrder,
}

const validateStyleStats: ValidateStyleStats = {
  filter: validateStatsFilter,
  order: validateStyleStatsOrder,
}

export function createStatsHandlers(context: Context): StatsHandlers {
  const { config, db, log } = context
  return {
    getOverall: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdFilteredStatsRequest,
      ): Promise<OverallStatsBody> => {
        const overall = await statsService.getOverall(
          async (statsFilter: StatsIdFilter): Promise<OverallStats> =>
            await overallStatsRepository.getOverall(db, statsFilter),
          validateStatsIdFilter,
          authTokenPayload,
          request.filter,
          log,
        )
        return { overall }
      },
    ),

    getAnnual: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdFilteredStatsRequest,
      ): Promise<AnnualStatsBody> => {
        const annual = await statsService.getAnnual(
          async (statsFilter: StatsIdFilter): Promise<AnnualStats> =>
            await annualStatsRepository.getAnnual(db, statsFilter),
          validateStatsIdFilter,
          authTokenPayload,
          request.filter,
          log,
        )
        return { annual }
      },
    ),

    getAnnualContainer: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginatedIdFilteredStatsRequest,
      ): Promise<AnnualContainerStatsBody> => {
        const annualContainer = await statsService.getAnnualContainer(
          async (
            pagination: Pagination,
            statsFilter: StatsIdFilter,
          ): Promise<AnnualContainerStats> =>
            await annualContainerStatsRepository.getAnnualContainer(
              db,
              pagination,
              statsFilter,
            ),
          validateAnnualContainerStats,
          authTokenPayload,
          request.pagination,
          request.filter,
          log,
        )
        return { annualContainer }
      },
    ),

    getBrewery: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginatedOrderedStatsRequest,
      ): Promise<BreweryStatsBody> => {
        const brewery = await statsService.getBrewery(
          async (
            pagination: Pagination,
            statsFilter: StatsFilter,
            breweryStatsOrder: BreweryStatsOrder,
          ): Promise<BreweryStats> =>
            await breweryStatsRepository.getBrewery(
              db,
              pagination,
              statsFilter,
              breweryStatsOrder,
            ),
          validateBreweryStats,
          authTokenPayload,
          request.pagination,
          orderedStatsQuery(request),
          log,
        )
        return { brewery }
      },
    ),

    getBreweryCountry: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginatedOrderedStatsRequest,
      ): Promise<BreweryCountryStatsBody> => {
        const breweryCountry = await statsService.getBreweryCountry(
          async (
            pagination: Pagination,
            statsFilter: StatsFilter,
            breweryCountryStatsOrder: BreweryCountryStatsOrder,
          ): Promise<BreweryCountryStats> =>
            await breweryCountryStatsRepository.getBreweryCountry(
              db,
              pagination,
              statsFilter,
              breweryCountryStatsOrder,
            ),
          validateBreweryCountryStats,
          authTokenPayload,
          request.pagination,
          orderedStatsQuery(request),
          log,
        )
        return { breweryCountry }
      },
    ),

    getContainer: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdFilteredStatsRequest,
      ): Promise<ContainerStatsBody> => {
        const container = await statsService.getContainer(
          async (statsFilter: StatsIdFilter): Promise<ContainerStats> =>
            await containerStatsRepository.getContainer(db, statsFilter),
          validateStatsIdFilter,
          authTokenPayload,
          request.filter,
          log,
        )
        return { container }
      },
    ),

    getLocation: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: PaginatedOrderedStatsRequest,
      ): Promise<LocationStatsBody> => {
        const location = await statsService.getLocation(
          async (
            pagination: Pagination,
            statsFilter: StatsFilter,
            locationStatsOrder: LocationStatsOrder,
          ): Promise<LocationStats> =>
            await locationStatsRepository.getLocation(
              db,
              pagination,
              statsFilter,
              locationStatsOrder,
            ),
          validateLocationStats,
          authTokenPayload,
          request.pagination,
          orderedStatsQuery(request),
          log,
        )
        return { location }
      },
    ),

    getRating: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdFilteredStatsRequest,
      ): Promise<RatingStatsBody> => {
        const rating = await statsService.getRating(
          async (statsFilter: StatsIdFilter): Promise<RatingStats> =>
            await ratingStatsRepository.getRating(db, statsFilter),
          validateStatsIdFilter,
          authTokenPayload,
          request.filter,
          log,
        )
        return { rating }
      },
    ),

    getStyle: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: OrderedStatsRequest,
      ): Promise<StyleStatsBody> => {
        const style = await statsService.getStyle(
          async (
            statsFilter: StatsFilter,
            styleStatsOrder: StyleStatsOrder,
          ): Promise<StyleStats> =>
            await styleStatsRepository.getStyle(
              db,
              statsFilter,
              styleStatsOrder,
            ),
          validateStyleStats,
          authTokenPayload,
          orderedStatsQuery(request),
          log,
        )
        return { style }
      },
    ),
  }
}

function orderedStatsQuery(request: OrderedStatsRequest): OrderedStatsQuery {
  return {
    ...request.filter,
    ...request.order,
  }
}
