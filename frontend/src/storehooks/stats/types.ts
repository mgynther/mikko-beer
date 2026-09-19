import type { Pagination } from '../types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
export interface OverallStats {
  beerCount: string
  breweryCount: string
  breweryCountryCount: string
  containerCount: string
  locationCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  reviewWithLocationCount: string
  reviewWithoutLocationCount: string
  styleCount: string
}

export interface OneAnnualStats {
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  year: string
}

export interface AnnualStats {
  annual: OneAnnualStats[]
}

export interface OneAnnualContainerStats {
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  reviewCount: string
  year: string
}

export interface AnnualContainerStats {
  annualContainer: OneAnnualContainerStats[]
}

export interface OneBreweryCountryStats {
  countryCode: string
  breweryCount: string
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  reviewedBeerCount: string
}

export interface BreweryCountryStats {
  breweryCountry: OneBreweryCountryStats[]
}

export interface OneBreweryStats {
  breweryId: string
  breweryName: string
  breweryCountry: string | undefined
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  reviewedBeerCount: string
}

export interface BreweryStats {
  brewery: OneBreweryStats[]
}

export interface OneContainerStats {
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
}

export interface ContainerStats {
  container: OneContainerStats[]
}

export interface OneLocationStats {
  locationId: string
  locationName: string
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
}

export interface LocationStats {
  location: OneLocationStats[]
}

export interface OneRatingStats {
  rating: string
  count: string
}

export interface RatingStats {
  rating: OneRatingStats[]
}

export interface OneStyleStats {
  reviewAverage: string
  reviewCount: string
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  styleId: string
  styleName: string
}

export interface StyleStats {
  style: OneStyleStats[]
}

export type ListDirection = 'asc' | 'desc'

export interface IdParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

export interface AnnualContainerStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  pagination: Pagination
}

export type BreweryCountryStatsSortingOrder =
  'average' | 'brewery_count' | 'count' | 'country_code' | 'std_dev'

export interface BreweryCountryStatsSorting {
  order: BreweryCountryStatsSortingOrder
  direction: ListDirection
}

export interface BreweryCountryStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  pagination: Pagination
  sorting: BreweryCountryStatsSorting
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: number
  timeEnd: number
}

export type BreweryStatsSortingOrder =
  'average' | 'brewery_name' | 'count' | 'std_dev'

export interface BreweryStatsSorting {
  order: BreweryStatsSortingOrder
  direction: ListDirection
}

export interface BreweryStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  pagination: Pagination
  sorting: BreweryStatsSorting
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: number
  timeEnd: number
}

export type LocationStatsSortingOrder =
  'average' | 'location_name' | 'count' | 'std_dev'

export interface LocationStatsSorting {
  order: LocationStatsSortingOrder
  direction: ListDirection
}

export interface LocationStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  pagination: Pagination
  sorting: LocationStatsSorting
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: number
  timeEnd: number
}

export type StyleStatsSortingOrder =
  'average' | 'style_name' | 'count' | 'std_dev'

export interface StyleStatsSorting {
  order: StyleStatsSortingOrder
  direction: ListDirection
}

export interface StyleStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  sorting: StyleStatsSorting
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
  timeStart: number
  timeEnd: number
}

// Nine store functions, for the same reason the validators arrive as one
// object: naming them one by one would make this factory's signature a list
// of a third of the store's surface.
export interface StatsQueryResult {
  data: unknown
  isLoading: boolean
}

export interface QueriedStatsResult<T> {
  query: (params: T) => Promise<unknown>
  data: unknown
  isFetching: boolean
}

export interface StatsStore {
  annual: (params: IdParams) => StatsQueryResult
  annualContainer: () => QueriedStatsResult<AnnualContainerStatsQueryParams>
  brewery: () => QueriedStatsResult<BreweryStatsQueryParams>
  breweryCountry: () => QueriedStatsResult<BreweryCountryStatsQueryParams>
  container: (params: IdParams) => StatsQueryResult
  location: () => QueriedStatsResult<LocationStatsQueryParams>
  overall: (params: IdParams) => StatsQueryResult
  rating: (params: IdParams) => StatsQueryResult
  style: (params: StyleStatsQueryParams) => StatsQueryResult
}

// Nine kinds of statistics, thirteen validators. They arrive as one object
// rather than as thirteen parameters: a factory that needs one validator
// names it, and this one would name a third of the validation layer.
export interface StatsValidators {
  annualOrUndefined: (result: unknown) => AnnualStats | undefined
  annualContainer: (result: unknown) => AnnualContainerStats
  annualContainerOrUndefined: (
    result: unknown,
  ) => AnnualContainerStats | undefined
  breweryCountry: (result: unknown) => BreweryCountryStats
  breweryCountryOrUndefined: (
    result: unknown,
  ) => BreweryCountryStats | undefined
  brewery: (result: unknown) => BreweryStats
  breweryOrUndefined: (result: unknown) => BreweryStats | undefined
  containerOrUndefined: (result: unknown) => ContainerStats | undefined
  location: (result: unknown) => LocationStats
  locationOrUndefined: (result: unknown) => LocationStats | undefined
  overallOrUndefined: (result: unknown) => OverallStats | undefined
  ratingOrUndefined: (result: unknown) => RatingStats | undefined
  styleOrUndefined: (result: unknown) => StyleStats | undefined
}

export interface StatsHookIf {
  annual: {
    useStats: (params: IdParams) => {
      stats: AnnualStats | undefined
      isLoading: boolean
    }
  }
  annualContainer: {
    useStats: () => {
      query: (
        params: AnnualContainerStatsQueryParams,
      ) => Promise<AnnualContainerStats>
      stats: AnnualContainerStats | undefined
      isLoading: boolean
    }
  }
  brewery: {
    useStats: () => {
      query: (params: BreweryStatsQueryParams) => Promise<BreweryStats>
      stats: BreweryStats | undefined
      isLoading: boolean
    }
  }
  breweryCountry: {
    useStats: () => {
      query: (
        params: BreweryCountryStatsQueryParams,
      ) => Promise<BreweryCountryStats>
      stats: BreweryCountryStats | undefined
      isLoading: boolean
    }
  }
  container: {
    useStats: (params: IdParams) => {
      stats: ContainerStats | undefined
      isLoading: boolean
    }
  }
  location: {
    useStats: () => {
      query: (params: LocationStatsQueryParams) => Promise<LocationStats>
      stats: LocationStats | undefined
      isLoading: boolean
    }
  }
  overall: {
    useStats: (params: IdParams) => {
      stats: OverallStats | undefined
      isLoading: boolean
    }
  }
  rating: {
    useStats: (params: IdParams) => {
      stats: RatingStats | undefined
      isLoading: boolean
    }
  }
  style: {
    useStats: (params: StyleStatsQueryParams) => {
      stats: StyleStats | undefined
      isLoading: boolean
    }
  }
}
