import type {
  AnnualContainerStats,
  AnnualContainerStatsQueryParams,
  BreweryStats,
  BreweryStatsQueryParams,
  IdParams,
  LocationStats,
  LocationStatsQueryParams,
  StatsHookIf,
  StyleStatsQueryParams,
} from '../../core/stats/types'
import {
  useGetAnnualStatsQuery,
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetAnnualContainerStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery,
} from '../../store/stats/api'
import {
  validateAnnualStatsOrUndefined,
  validateAnnualContainerStats,
  validateAnnualContainerStatsOrUndefined,
  validateBreweryStats,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStats,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined,
} from '../../validation/stats'

const stats: () => StatsHookIf = () => {
  const statsIf: StatsHookIf = {
    annual: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetAnnualStatsQuery(params)
        return {
          stats: validateAnnualStatsOrUndefined(data),
          isLoading,
        }
      },
    },
    annualContainer: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetAnnualContainerStatsQuery()
        return {
          query: async (
            params: AnnualContainerStatsQueryParams,
          ): Promise<AnnualContainerStats> => {
            const result = await trigger(params)
            return validateAnnualContainerStats(result.data)
          },
          stats: validateAnnualContainerStatsOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    brewery: {
      useStats: () => {
        const [trigger, { data, isFetching }] = useLazyGetBreweryStatsQuery()
        return {
          query: async (
            params: BreweryStatsQueryParams,
          ): Promise<BreweryStats> => {
            const result = await trigger(params)
            return validateBreweryStats(result.data)
          },
          stats: validateBreweryStatsOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    container: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetContainerStatsQuery(params)
        return {
          stats: validateContainerStatsOrUndefined(data),
          isLoading,
        }
      },
    },
    location: {
      useStats: () => {
        const [trigger, { data, isFetching }] = useLazyGetLocationStatsQuery()
        return {
          query: async (
            params: LocationStatsQueryParams,
          ): Promise<LocationStats> => {
            const result = await trigger(params)
            return validateLocationStats(result.data)
          },
          stats: validateLocationStatsOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
    overall: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetOverallStatsQuery(params)
        return {
          stats: validateOverallStatsOrUndefined(data?.overall),
          isLoading,
        }
      },
    },
    rating: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetRatingStatsQuery(params)
        return {
          stats: validateRatingStatsOrUndefined(data),
          isLoading,
        }
      },
    },
    style: {
      useStats: (params: StyleStatsQueryParams) => {
        const { data, isFetching } = useGetStyleStatsQuery(params)
        return {
          stats: validateStyleStatsOrUndefined(data),
          isLoading: isFetching,
        }
      },
    },
  }
  return statsIf
}

export default stats
