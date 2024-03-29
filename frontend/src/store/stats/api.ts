import { emptySplitApi } from '../api'

import { type Pagination } from '../types'

import {
  type AnnualStats,
  type BreweryStats,
  type BreweryStatsSorting,
  type OverallStats,
  type RatingStats,
  type StyleStats,
  type StyleStatsSorting,
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

function breweryStatsSorting (sorting: BreweryStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function andMaxReviewCount (maxReviewCount: number): string {
  if (!isFinite(maxReviewCount)) return ''
  return `&max_review_count=${maxReviewCount}`
}

function styleFilters (
  breweryId: string | undefined,
  sorting: StyleStatsSorting
): string {
  return `?${styleStatsSorting(sorting)}${andBreweryIdFilter(breweryId)}`
}

function styleStatsSorting (sorting: StyleStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
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
      sorting: BreweryStatsSorting
      minReviewCount: number
      maxReviewCount: number
      minReviewAverage: number
      maxReviewAverage: number
    }>({
      query: (params: {
        breweryId: string | undefined
        pagination: Pagination
        sorting: BreweryStatsSorting
        minReviewCount: number
        maxReviewCount: number
        minReviewAverage: number
        maxReviewAverage: number
      }) => ({
        url: `/stats/brewery?size=${
          params.pagination.size
          }&skip=${
            params.pagination.skip
          }${
          andBreweryIdFilter(params.breweryId)
        }&${breweryStatsSorting(params.sorting)}&min_review_count=${
          params.minReviewCount
        }${
          andMaxReviewCount(params.maxReviewCount)
        }&min_review_average=${
          params.minReviewAverage
        }&max_review_average=${params.maxReviewAverage}`,
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
    getStyleStats: build.query<StyleStats, {
      breweryId: string | undefined
      sorting: StyleStatsSorting
      minReviewCount: number
      maxReviewCount: number
      minReviewAverage: number
      maxReviewAverage: number
    }>({
      query: (params: {
        breweryId: string | undefined
        sorting: StyleStatsSorting
        minReviewCount: number
        maxReviewCount: number
        minReviewAverage: number
        maxReviewAverage: number
      }) => ({
        url: `/stats/style${
          styleFilters(params.breweryId, params.sorting)
        }&min_review_count=${
          params.minReviewCount
        }${
          andMaxReviewCount(params.maxReviewCount)
        }&min_review_average=${
          params.minReviewAverage
        }&max_review_average=${
          params.maxReviewAverage
        }`,
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
