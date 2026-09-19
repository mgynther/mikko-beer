import type {
  AnnualContainerStats,
  AnnualContainerStatsQueryParams,
  BreweryCountryStats,
  BreweryCountryStatsQueryParams,
  BreweryStats,
  BreweryStatsQueryParams,
  IdParams,
  LocationStats,
  LocationStatsQueryParams,
  StatsHookIf,
  StatsStore,
  StatsValidators,
  StyleStatsQueryParams,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const stats: (store: StatsStore, validators: StatsValidators) => StatsHookIf = (
  store,
  validators,
) => {
  const statsIf: StatsHookIf = {
    annual: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = store.annual(params)
        return {
          stats: validators.annualOrUndefined(data),
          isLoading,
        }
      },
    },
    annualContainer: {
      useStats: () => {
        const { query, data, isFetching } = store.annualContainer()
        return {
          query: async (
            params: AnnualContainerStatsQueryParams,
          ): Promise<AnnualContainerStats> => {
            return validators.annualContainer(await query(params))
          },
          stats: validators.annualContainerOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    brewery: {
      useStats: () => {
        const { query, data, isFetching } = store.brewery()
        return {
          query: async (
            params: BreweryStatsQueryParams,
          ): Promise<BreweryStats> => {
            return validators.brewery(await query(params))
          },
          stats: validators.breweryOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    breweryCountry: {
      useStats: () => {
        const { query, data, isFetching } = store.breweryCountry()
        return {
          query: async (
            params: BreweryCountryStatsQueryParams,
          ): Promise<BreweryCountryStats> => {
            return validators.breweryCountry(await query(params))
          },
          stats: validators.breweryCountryOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    container: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = store.container(params)
        return {
          stats: validators.containerOrUndefined(data),
          isLoading,
        }
      },
    },
    location: {
      useStats: () => {
        const { query, data, isFetching } = store.location()
        return {
          query: async (
            params: LocationStatsQueryParams,
          ): Promise<LocationStats> => {
            return validators.location(await query(params))
          },
          stats: validators.locationOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    overall: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = store.overall(params)
        return {
          stats: validators.overallOrUndefined(
            unwrapMemberOrUndefined(data, 'overall'),
          ),
          isLoading,
        }
      },
    },
    rating: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = store.rating(params)
        return {
          stats: validators.ratingOrUndefined(data),
          isLoading,
        }
      },
    },
    style: {
      useStats: (params: StyleStatsQueryParams) => {
        const { data, isLoading } = store.style(params)
        return {
          stats: validators.styleOrUndefined(data),
          isLoading,
        }
      },
    },
  }
  return statsIf
}

export default stats
