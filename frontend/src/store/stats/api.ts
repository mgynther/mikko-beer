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

function styleIdFilter (styleId: string): string {
  return `style=${styleId}`
}

function breweryStyleFilter (
  { breweryId, styleId }: BreweryStyleParams
): string {
  if (breweryId !== undefined) return `${breweryIdFilter(breweryId)}`
  if (styleId !== undefined) return `${styleIdFilter(styleId)}`
  return ''
}

function onlyBreweryStyleFilter (params: BreweryStyleParams
): string {
  const filter = breweryStyleFilter(params)
  return filter.length === 0 ? '' : `?${filter}`
}

function andBreweryStyleFilter (params: BreweryStyleParams
): string {
  const filter = breweryStyleFilter(params)
  return filter.length === 0 ? '' : `&${filter}`
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
  styleId: string | undefined,
  sorting: StyleStatsSorting
): string {
  const styleSorting = styleStatsSorting(sorting)
  const breweryStyleFilter = andBreweryStyleFilter({ breweryId, styleId })
  return `?${styleSorting}${breweryStyleFilter}`
}

function styleStatsSorting (sorting: StyleStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

interface BreweryStyleParams {
  breweryId: string | undefined
  styleId: string | undefined
}

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<AnnualStats, BreweryStyleParams>({
      query: (params: BreweryStyleParams) => ({
        url: `/stats/annual${onlyBreweryStyleFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Annual]
    }),
    getBreweryStats: build.query<BreweryStats, {
      breweryId: string | undefined
      styleId: string | undefined
      pagination: Pagination
      sorting: BreweryStatsSorting
      minReviewCount: number
      maxReviewCount: number
      minReviewAverage: number
      maxReviewAverage: number
    }>({
      query: (params: {
        breweryId: string | undefined
        styleId: string | undefined
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
          andBreweryStyleFilter(params)
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
    }, BreweryStyleParams>({
      query: (params: BreweryStyleParams) => ({
        url: `/stats/overall${onlyBreweryStyleFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Overall]
    }),
    getRatingStats: build.query<RatingStats, BreweryStyleParams>({
      query: (params: BreweryStyleParams) => ({
        url: `/stats/rating${onlyBreweryStyleFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Rating]
    }),
    getStyleStats: build.query<StyleStats, {
      breweryId: string | undefined
      styleId: string | undefined
      sorting: StyleStatsSorting
      minReviewCount: number
      maxReviewCount: number
      minReviewAverage: number
      maxReviewAverage: number
    }>({
      query: (params: {
        breweryId: string | undefined
        styleId: string | undefined
        sorting: StyleStatsSorting
        minReviewCount: number
        maxReviewCount: number
        minReviewAverage: number
        maxReviewAverage: number
      }) => ({
        url: `/stats/style${
          styleFilters(params.breweryId, params.styleId, params.sorting)
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
