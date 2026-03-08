import type { NavigateIf } from "../components/util"
import type {
  AnnualContainerStats,
  AnnualContainerStatsQueryParams,
  BreweryStats,
  BreweryStatsQueryParams,
  IdParams,
  LocationStats,
  LocationStatsQueryParams,
  StatsIf,
  StyleStatsQueryParams,
  YearMonth
} from "../core/stats/types"
import type { InfiniteScroll, UseDebounce } from "../core/types"
import {
  useGetAnnualStatsQuery,
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetAnnualContainerStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery
} from "../store/stats/api"
import {
  validateAnnualStatsOrUndefined,
  validateAnnualContainerStatsOrUndefined,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined
} from "../validation/stats"
import { createSetSearch } from "./set-search"

const stats: (
  infiniteScroll: InfiniteScroll,
  navigateIf: NavigateIf,
  minTime: YearMonth,
  maxTime: YearMonth,
  getUseDebounce: <T>() => UseDebounce<T>
) => StatsIf = (
  infiniteScroll: InfiniteScroll,
  navigateIf: NavigateIf,
  minTime: YearMonth,
  maxTime: YearMonth,
  getUseDebounce: <T>() => UseDebounce<T>
) => {
  const statsIf: StatsIf = {
    annual: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetAnnualStatsQuery(params)
        return {
          stats: validateAnnualStatsOrUndefined(data),
          isLoading
        }
      }
    },
    annualContainer: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetAnnualContainerStatsQuery()
        return {
          query: async (
            params: AnnualContainerStatsQueryParams
          ): Promise<AnnualContainerStats | undefined> => {
            const result = await trigger(params)
            return validateAnnualContainerStatsOrUndefined(result.data)
          },
          stats: validateAnnualContainerStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      infiniteScroll
    },
    brewery: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetBreweryStatsQuery()
        return {
          query: async (
            params: BreweryStatsQueryParams
          ): Promise<BreweryStats | undefined> => {
            const result = await trigger(params)
            return validateBreweryStatsOrUndefined(result.data)
          },
          stats: validateBreweryStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce
    },
    container: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetContainerStatsQuery(params)
        return {
          stats: validateContainerStatsOrUndefined(data),
          isLoading
        }
      }
    },
    location: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetLocationStatsQuery()
        return {
          query: async (
            params: LocationStatsQueryParams
          ): Promise<LocationStats | undefined> => {
            const result = await trigger(params)
            return validateLocationStatsOrUndefined(result.data)
          },
          stats: validateLocationStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce
    },
    overall: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetOverallStatsQuery(params)
        return {
          stats: validateOverallStatsOrUndefined(data?.overall),
          isLoading
        }
      }
    },
    rating: {
      useStats: (params: IdParams) => {
        const { data, isLoading } = useGetRatingStatsQuery(params)
        return {
          stats: validateRatingStatsOrUndefined(data),
          isLoading
        }
      }
    },
    style: {
      useStats: (params: StyleStatsQueryParams) => {
        const { data, isFetching } = useGetStyleStatsQuery(params)
        return {
          stats: validateStyleStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      minTime,
      maxTime,
      getUseDebounce
    },
    setSearch: createSetSearch(navigateIf)
  }
  return statsIf
}

export default stats
