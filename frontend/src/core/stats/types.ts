import type {
  InfiniteScroll,
  ListDirection,
  Pagination
} from '../types'

export interface IdParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
  locationCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  styleCount: string
}

export interface AnnualStats {
  annual: Array<{
    reviewAverage: string
    reviewCount: string
    year: string
  }>
}

export interface OneBreweryStats {
  breweryId: string
  breweryName: string
  reviewAverage: string
  reviewCount: string
}

export interface BreweryStats {
  brewery: OneBreweryStats[]
}

export type BreweryStatsSortingOrder = 'average' | 'brewery_name' | 'count'

export interface BreweryStatsSorting {
  order: BreweryStatsSortingOrder
  direction: ListDirection
}

export interface OneLocationStats {
  locationId: string
  locationName: string
  reviewAverage: string
  reviewCount: string
}

export interface LocationStats {
  location: OneLocationStats[]
}

export type LocationStatsSortingOrder = 'average' | 'location_name' | 'count'

export interface LocationStatsSorting {
  order: LocationStatsSortingOrder
  direction: ListDirection
}

export interface OneContainerStats {
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewCount: string
}

export interface ContainerStats {
  container: OneContainerStats[]
}

export interface RatingStats {
  rating: Array<{
    rating: string
    count: string
  }>
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
}

export interface StyleStats {
  style: Array<{
    reviewAverage: string
    reviewCount: string
    styleId: string
    styleName: string
  }>
}

export type StyleStatsSortingOrder = 'average' | 'style_name' | 'count'

export interface StyleStatsSorting {
  order: StyleStatsSortingOrder
  direction: ListDirection
}

export interface StatsFilter {
  value: number
  setValue: (value: number) => void
}

export interface StatsFilters {
  minReviewCount: StatsFilter
  maxReviewCount: StatsFilter
  minReviewAverage: StatsFilter
  maxReviewAverage: StatsFilter
}

export interface GetAnnualStatsIf {
  useStats: (params: IdParams) => {
    stats: AnnualStats | undefined
    isLoading: boolean
  }
}

export interface GetBreweryStatsIf {
  useStats: () => {
    query: (
      params: BreweryStatsQueryParams
    ) => Promise<BreweryStats | undefined>
    stats: BreweryStats | undefined
    isLoading: boolean
  },
  infiniteScroll: InfiniteScroll
}

export interface GetContainerStatsIf {
  useStats: (params: IdParams) => {
    stats: ContainerStats | undefined
    isLoading: boolean
  }
}

export interface GetLocationStatsIf {
  useStats: () => {
    query: (
      params: LocationStatsQueryParams
    ) => Promise<LocationStats | undefined>
    stats: LocationStats | undefined
    isLoading: boolean
  },
  infiniteScroll: InfiniteScroll
}

export interface GetOverallStatsIf {
  useStats: (params: IdParams) => {
    stats: OverallStats | undefined
    isLoading: boolean
  }
}

export interface GetRatingStatsIf {
  useStats: (params: IdParams) => {
    stats: RatingStats | undefined
    isLoading: boolean
  }
}

export interface GetStyleStatsIf {
  useStats: (params: StyleStatsQueryParams) => {
    stats: StyleStats | undefined
    isLoading: boolean
  }
}

export interface StatsIf {
  annual: GetAnnualStatsIf
  brewery: GetBreweryStatsIf
  container: GetContainerStatsIf
  location: GetLocationStatsIf
  overall: GetOverallStatsIf
  rating: GetRatingStatsIf
  style: GetStyleStatsIf
  setSearch: (mode: string, state: Record<string, string>) => Promise<void>
}
