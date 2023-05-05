import { emptySplitApi } from '../api'

import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type StyleStats,
  StatsTags
} from './types'

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<AnnualStats, void>({
      query: () => ({
        url: '/stats/annual',
        method: 'GET'
      }),
      providesTags: [StatsTags.Annual]
    }),
    getBreweryStats: build.query<BreweryStats, void>({
      query: () => ({
        url: '/stats/brewery',
        method: 'GET'
      }),
      providesTags: [StatsTags.Brewery]
    }),
    getOverallStats: build.query<{ overall: OverallStats }, void>({
      query: () => ({
        url: '/stats/overall',
        method: 'GET'
      }),
      providesTags: [StatsTags.Overall]
    }),
    getStyleStats: build.query<StyleStats, void>({
      query: () => ({
        url: '/stats/style',
        method: 'GET'
      }),
      providesTags: [StatsTags.Style]
    })
  })
})

export const {
  useGetAnnualStatsQuery,
  useGetBreweryStatsQuery,
  useGetOverallStatsQuery,
  useGetStyleStatsQuery
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
