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

function breweryIdFilter (breweryId: string): string {
  return `brewery=${breweryId}`
}

function andBreweryIdFilter (breweryId: string | undefined): string {
  if (breweryId === undefined) return ''
  return `&${breweryIdFilter(breweryId)}`
}

function onlyBreweryIdFilter (breweryId: string | undefined): string {
  if (breweryId === undefined) return ''
  return `?${breweryIdFilter(breweryId)}`
}

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<AnnualStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/annual${onlyBreweryIdFilter(breweryId)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Annual]
    }),
    getBreweryStats: build.query<BreweryStats, {
      breweryId: string | undefined
      pagination: Pagination
    }>({
      query: (params: {
        breweryId: string | undefined
        pagination: Pagination
      }) => ({
        url: `/stats/brewery?size=${
          params.pagination.size
          }&skip=${
            params.pagination.skip
          }${
          andBreweryIdFilter(params.breweryId)
        }`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Brewery]
    }),
    getOverallStats: build.query<{
      overall: OverallStats
    }, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/overall${onlyBreweryIdFilter(breweryId)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Overall]
    }),
    getRatingStats: build.query<RatingStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/rating${onlyBreweryIdFilter(breweryId)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Rating]
    }),
    getStyleStats: build.query<StyleStats, string | undefined>({
      query: (breweryId: string | undefined) => ({
        url: `/stats/style${onlyBreweryIdFilter(breweryId)}`,
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
