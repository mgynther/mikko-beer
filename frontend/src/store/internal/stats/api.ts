import { emptySplitApi } from '../api'

import type {
  AnnualContainerStatsQueryParams,
  BreweryCountryStatsQueryParams,
  BreweryCountryStatsSorting,
  BreweryStatsQueryParams,
  BreweryStatsSorting,
  IdParams,
  LocationStatsQueryParams,
  LocationStatsSorting,
  StyleStatsQueryParams,
  StyleStatsSorting,
} from './requests'

import { StatsTags } from './tags'

function breweryIdFilter(breweryId: string): string {
  return `brewery=${breweryId}`
}

function locationIdFilter(locationId: string): string {
  return `location=${locationId}`
}

function styleIdFilter(styleId: string): string {
  return `style=${styleId}`
}

function idFilter({ breweryId, locationId, styleId }: IdParams): string {
  if (breweryId !== undefined) return breweryIdFilter(breweryId)
  if (locationId !== undefined) return locationIdFilter(locationId)
  if (styleId !== undefined) return styleIdFilter(styleId)
  return ''
}

function onlyIdFilter(params: IdParams): string {
  const filter = idFilter(params)
  if (filter.length === 0) {
    return ''
  }
  return `?${filter}`
}

function andIdFilter(params: IdParams): string {
  const filter = idFilter(params)
  if (filter.length === 0) {
    return ''
  }
  return `&${filter}`
}

function breweryCountryStatsSorting(
  sorting: BreweryCountryStatsSorting,
): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function breweryStatsSorting(sorting: BreweryStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function locationStatsSorting(sorting: LocationStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

function andMaxReviewCount(maxReviewCount: number): string {
  if (!isFinite(maxReviewCount)) {
    return ''
  }
  return `&max_review_count=${maxReviewCount}`
}

function statsFilters(
  params:
    | BreweryCountryStatsQueryParams
    | BreweryStatsQueryParams
    | LocationStatsQueryParams
    | StyleStatsQueryParams,
): string {
  return `min_review_count=${params.minReviewCount}${andMaxReviewCount(
    params.maxReviewCount,
  )}&min_review_average=${params.minReviewAverage}&max_review_average=${
    params.maxReviewAverage
  }&time_start=${params.timeStart}&time_end=${params.timeEnd}`
}

function styleFilters(
  breweryId: string | undefined,
  locationId: string | undefined,
  styleId: string | undefined,
  sorting: StyleStatsSorting,
): string {
  const styleSorting = styleStatsSorting(sorting)
  const idFilter = andIdFilter({ breweryId, locationId, styleId })
  return `?${styleSorting}${idFilter}`
}

function styleStatsSorting(sorting: StyleStatsSorting): string {
  return `order=${sorting.order}&direction=${sorting.direction}`
}

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnualStats: build.query<unknown, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/annual${onlyIdFilter(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Annual],
    }),
    getAnnualContainerStats: build.query<
      unknown,
      AnnualContainerStatsQueryParams
    >({
      query: (params: AnnualContainerStatsQueryParams) => ({
        url: `/stats/annual_container?size=${params.pagination.size}&skip=${
          params.pagination.skip
        }${andIdFilter(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.AnnualContainer],
    }),
    getBreweryStats: build.query<unknown, BreweryStatsQueryParams>({
      query: (params: BreweryStatsQueryParams) => ({
        url: `/stats/brewery?size=${params.pagination.size}&skip=${
          params.pagination.skip
        }${andIdFilter(
          params,
        )}&${breweryStatsSorting(params.sorting)}&${statsFilters(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Brewery],
    }),
    getBreweryCountryStats: build.query<
      unknown,
      BreweryCountryStatsQueryParams
    >({
      query: (params: BreweryCountryStatsQueryParams) => ({
        url: `/stats/brewery_country?size=${params.pagination.size}&skip=${
          params.pagination.skip
        }${andIdFilter(params)}&${breweryCountryStatsSorting(
          params.sorting,
        )}&${statsFilters(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.BreweryCountry],
    }),
    getContainerStats: build.query<unknown, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/container${onlyIdFilter(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Container],
    }),
    getLocationStats: build.query<unknown, LocationStatsQueryParams>({
      query: (params: LocationStatsQueryParams) => ({
        url: `/stats/location?size=${params.pagination.size}&skip=${
          params.pagination.skip
        }${andIdFilter(
          params,
        )}&${locationStatsSorting(params.sorting)}&${statsFilters(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Location],
    }),
    getOverallStats: build.query<unknown, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/overall${onlyIdFilter(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Overall],
    }),
    getRatingStats: build.query<unknown, IdParams>({
      query: (params: IdParams) => ({
        url: `/stats/rating${onlyIdFilter(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Rating],
    }),
    getStyleStats: build.query<unknown, StyleStatsQueryParams>({
      query: (params: StyleStatsQueryParams) => ({
        url: `/stats/style${styleFilters(
          params.breweryId,
          params.locationId,
          params.styleId,
          params.sorting,
        )}&${statsFilters(params)}`,
        method: 'GET',
      }),
      providesTags: [StatsTags.Style],
    }),
  }),
})

export const {
  useGetAnnualStatsQuery,
  useGetContainerStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetAnnualContainerStatsQuery,
  useLazyGetBreweryCountryStatsQuery,
  useLazyGetBreweryStatsQuery,
  useLazyGetLocationStatsQuery,
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
