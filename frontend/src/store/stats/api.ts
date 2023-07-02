import { emptySplitApi } from '../api'

import { type Pagination } from '../types'

import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type RatingStats,
  type StyleStats,
  StatsTags
} from './types'

function breweryIdFilter (breweryId: string | undefined): string {
  if (breweryId === undefined) return ''
  return `?brewery=${breweryId}`
}

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<AnnualStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/annual${breweryIdFilter(breweryId)}`,
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
    getRatingStats: build.query<RatingStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/rating${breweryIdFilter(breweryId)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Rating]
    }),
    getStyleStats: build.query<StyleStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/style${breweryIdFilter(breweryId)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Style]
    })
  })
})

export const {
  useGetAnnualStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
