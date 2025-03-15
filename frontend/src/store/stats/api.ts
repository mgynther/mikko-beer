import { emptySplitApi } from '../api'

import type {
  BreweryStatsQueryParams,
  IdParams,
  ContainerStats,
  LocationStatsQueryParams,
  StyleStatsQueryParams,
  AnnualStats,
  BreweryStats,
  BreweryStatsSorting,
  LocationStats,
  LocationStatsSorting,
  OverallStats,
  RatingStats,
  StyleStats,
  StyleStatsSorting
} from '../../core/stats/types'

import { StatsTags } from './types'

function breweryIdFilter (breweryId: string): string {
  return `brewery=${breweryId}`
}

function locationIdFilter (locationId: string): string {
  return `location=${locationId}`
}

function styleIdFilter (styleId: string): string {
  return `style=${styleId}`
}

function idFilter (
  { breweryId, locationId, styleId }: IdParams
): string {
  if (breweryId !== undefined) return breweryIdFilter(breweryId)
  if (locationId !== undefined) return locationIdFilter(locationId)
  if (styleId !== undefined) return styleIdFilter(styleId)
  return ''
}

function onlyIdFilter (params: IdParams
): string {
  const filter = idFilter(params)
  return filter.length === 0 ? '' : `?${filter}`
}

function andIdFilter (params: IdParams
): string {
  const filter = idFilter(params)
  return filter.length === 0 ? '' : `&${filter}`
}

function breweryStatsSorting (sorting: BreweryStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function locationStatsSorting (sorting: LocationStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function andMaxReviewCount (maxReviewCount: number): string {
  if (!isFinite(maxReviewCount)) return ''
  return `&max_review_count=${maxReviewCount}`
}

function styleFilters (
  breweryId: string | undefined,
  locationId: string | undefined,
  styleId: string | undefined,
  sorting: StyleStatsSorting
): string {
  const styleSorting = styleStatsSorting(sorting)
  const idFilter = andIdFilter({ breweryId, locationId, styleId })
  return `?${styleSorting}${idFilter}`
}

function styleStatsSorting (sorting: StyleStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<AnnualStats, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/annual${onlyIdFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Annual]
    }),
    getBreweryStats: build.query<BreweryStats, BreweryStatsQueryParams>({
      query: (params: BreweryStatsQueryParams) => ({
        url: `/stats/brewery?size=${
          params.pagination.size
          }&skip=${
            params.pagination.skip
          }${
          andIdFilter(params)
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
    getContainerStats: build.query<ContainerStats, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/container${onlyIdFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Container]
    }),
    getLocationStats: build.query<LocationStats, LocationStatsQueryParams>({
      query: (params: LocationStatsQueryParams) => ({
        url: `/stats/location?size=${
          params.pagination.size
          }&skip=${
            params.pagination.skip
          }${
          andIdFilter(params)
        }&${locationStatsSorting(params.sorting)}&min_review_count=${
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
    }, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/overall${onlyIdFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Overall]
    }),
    getRatingStats: build.query<RatingStats, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/rating${onlyIdFilter(params)}`,
        method: 'GET'
      }),
      providesTags: [StatsTags.Rating]
    }),
    getStyleStats: build.query<StyleStats, StyleStatsQueryParams>({
      query: (params: StyleStatsQueryParams) => ({
        url: `/stats/style${
          styleFilters(
            params.breweryId,
            params.locationId,
            params.styleId,
            params.sorting
          )
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
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
