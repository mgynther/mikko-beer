import type {
  BreweryStatsQueryParams,
  BreweryStyleParams,
  StatsIf,
  StyleStatsQueryParams
} from "../core/stats/types"
import type { InfiniteScroll } from "../core/types"
import {
  useGetAnnualStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery
} from "../store/stats/api"

const stats: (
  infiniteScroll: InfiniteScroll
) => StatsIf = (
  infiniteScroll: InfiniteScroll
) => {
  const statsIf: StatsIf = {
    annual: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetAnnualStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    },
    brewery: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetBreweryStatsQuery()
        return {
          query: async (
            params: BreweryStatsQueryParams
          ) => (await trigger(params)).data,
          stats: data,
          isLoading: isFetching
        }
      },
      infiniteScroll
    },
    overall: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetOverallStatsQuery(params)
        return {
          stats: data?.overall,
          isLoading
        }
      }
    },
    rating: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetRatingStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    },
    style: {
      useStats: (params: StyleStatsQueryParams) => {
        const { data, isLoading } = useGetStyleStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    }
  }
  return statsIf
}

export default stats
