import type {
  AnnualContainerStatsQueryParams,
  BreweryCountryStatsQueryParams,
  BreweryStatsQueryParams,
  IdParams,
  LocationStatsQueryParams,
  StyleStatsQueryParams,
} from './internal/stats/requests'
import {
  useGetAnnualStatsQuery,
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetAnnualContainerStatsQuery,
  useLazyGetBreweryCountryStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery,
} from './internal/stats/api'

// The public surface of the statistics endpoints. See store/beer.ts for why
// every result is built here rather than handed on as the query hook returned
// it.
export interface StatsResult {
  data: unknown
  isLoading: boolean
}

// The queried statistics do not unwrap: a failed query gives undefined data
// rather than rejecting, which is what the filtered views that call them
// expect while the user is still moving the filters around.
export interface QueriedStatsResult<T> {
  query: (params: T) => Promise<unknown>
  data: unknown
  isFetching: boolean
}

export type AnnualContainerStatsResult =
  QueriedStatsResult<AnnualContainerStatsQueryParams>

export type BreweryStatsResult = QueriedStatsResult<BreweryStatsQueryParams>

export type BreweryCountryStatsResult =
  QueriedStatsResult<BreweryCountryStatsQueryParams>

export type LocationStatsResult = QueriedStatsResult<LocationStatsQueryParams>

export function useGetAnnualStats(params: IdParams): StatsResult {
  const { data, isLoading } = useGetAnnualStatsQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useGetContainerStats(params: IdParams): StatsResult {
  const { data, isLoading } = useGetContainerStatsQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useGetOverallStats(params: IdParams): StatsResult {
  const { data, isLoading } = useGetOverallStatsQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useGetRatingStats(params: IdParams): StatsResult {
  const { data, isLoading } = useGetRatingStatsQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useGetStyleStats(params: StyleStatsQueryParams): StatsResult {
  const { data, isFetching } = useGetStyleStatsQuery(params)
  return {
    data,
    isLoading: isFetching,
  }
}

export function useGetAnnualContainerStats(): AnnualContainerStatsResult {
  const [trigger, { data, isFetching }] = useLazyGetAnnualContainerStatsQuery()
  return {
    query: async (
      params: AnnualContainerStatsQueryParams,
    ): Promise<unknown> => {
      const result = await trigger(params)
      return result.data
    },
    data,
    isFetching,
  }
}

export function useGetBreweryStats(): BreweryStatsResult {
  const [trigger, { data, isFetching }] = useLazyGetBreweryStatsQuery()
  return {
    query: async (params: BreweryStatsQueryParams): Promise<unknown> => {
      const result = await trigger(params)
      return result.data
    },
    data,
    isFetching,
  }
}

export function useGetBreweryCountryStats(): BreweryCountryStatsResult {
  const [trigger, { data, isFetching }] = useLazyGetBreweryCountryStatsQuery()
  return {
    query: async (params: BreweryCountryStatsQueryParams): Promise<unknown> => {
      const result = await trigger(params)
      return result.data
    },
    data,
    isFetching,
  }
}

export function useGetLocationStats(): LocationStatsResult {
  const [trigger, { data, isFetching }] = useLazyGetLocationStatsQuery()
  return {
    query: async (params: LocationStatsQueryParams): Promise<unknown> => {
      const result = await trigger(params)
      return result.data
    },
    data,
    isFetching,
  }
}
