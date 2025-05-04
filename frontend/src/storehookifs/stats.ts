import type { NavigateIf } from "../components/util"
import type {
  BreweryStatsQueryParams,
  IdParams,
  LocationStatsQueryParams,
  StatsIf,
  StyleStatsQueryParams
} from "../core/stats/types"
import type { InfiniteScroll } from "../core/types"
import {
  useGetAnnualStatsQuery,
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery
} from "../store/stats/api"
import {
  validateAnnualStatsOrUndefined,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined
} from "../validation/stats"

const stats: (
  infiniteScroll: InfiniteScroll,
  navigateIf: NavigateIf
) => StatsIf = (
  infiniteScroll: InfiniteScroll,
  navigateIf: NavigateIf
) => {
  const navigate = navigateIf.useNavigate()
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
    brewery: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetBreweryStatsQuery()
        return {
          query: async (
            params: BreweryStatsQueryParams
          ) => {
            const result = await trigger(params)
            return validateBreweryStatsOrUndefined(result.data)
          },
          stats: validateBreweryStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      infiniteScroll
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
          ) => {
            const result = await trigger(params)
            return validateLocationStatsOrUndefined(result.data)
          },
          stats: validateLocationStatsOrUndefined(data),
          isLoading: isFetching
        }
      },
      infiniteScroll
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
        const { data, isLoading } = useGetStyleStatsQuery(params)
        return {
          stats: validateStyleStatsOrUndefined(data),
          isLoading
        }
      }
    },
    setSearch: async (mode: string, state: Record<string, string>) => {
      const stateParts = Object.keys(state).map(
        key => `${key}=${state[key]}`
      )
      const baseSearch = `?stats=${mode}`
      const allParts = [baseSearch, ...stateParts]
      const newSearch = allParts.join('&')
      await navigate(newSearch, { replace: true })
    }
  }
  return statsIf
}

export default stats
