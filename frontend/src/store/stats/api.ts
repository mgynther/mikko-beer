import { emptySplitApi } from '../api'

import { type Pagination } from '../types'

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
    getBreweryStats: build.query<BreweryStats, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/stats/brewery?size=${pagination.size}&skip=${pagination.skip}`,
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
  useGetOverallStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
