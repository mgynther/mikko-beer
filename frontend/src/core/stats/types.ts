import type {
  InfiniteScroll,
  ListDirection,
  Pagination,
  UseDebounce,
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
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
  styleCount: string
}

export interface AnnualStats {
  annual: Array<{
    reviewAverage: string
    reviewCount: string
    reviewMedian: string
    reviewMode: string
    reviewStandardDeviation: string
    year: string
  }>
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

export interface AnnualContainerStatsQueryParams {
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  pagination: Pagination
}

export interface OneBreweryStats {
  breweryId: string
  breweryName: string
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
  reviewMedian: string
  reviewMode: string
  reviewStandardDeviation: string
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
  timeStart: number
  timeEnd: number
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

export interface YearMonth {
  year: number
  month: number
}

export interface YearMonthFilter {
  min: YearMonth
  max: YearMonth
  value: YearMonth
  setValue: (yearMonth: YearMonth) => void
}

export interface StatsFilters {
  minReviewCount: StatsFilter
  maxReviewCount: StatsFilter
  minReviewAverage: StatsFilter
  maxReviewAverage: StatsFilter
  timeStart: YearMonthFilter
  timeEnd: YearMonthFilter
}

export interface StatsNoTimeFilters {
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

export interface GetAnnualContainerStatsIf {
  useStats: () => {
    query: (
      params: AnnualContainerStatsQueryParams,
    ) => Promise<AnnualContainerStats>
    stats: AnnualContainerStats | undefined
    isLoading: boolean
  }
  infiniteScroll: InfiniteScroll
}

export interface GetBreweryStatsIf {
  useStats: () => {
    query: (params: BreweryStatsQueryParams) => Promise<BreweryStats>
    stats: BreweryStats | undefined
    isLoading: boolean
  }
  infiniteScroll: InfiniteScroll
  minTime: YearMonth
  maxTime: YearMonth
  getUseDebounce: <T>() => UseDebounce<T>
}

export interface GetContainerStatsIf {
  useStats: (params: IdParams) => {
    stats: ContainerStats | undefined
    isLoading: boolean
  }
}

export interface GetLocationStatsIf {
  useStats: () => {
    query: (params: LocationStatsQueryParams) => Promise<LocationStats>
    stats: LocationStats | undefined
    isLoading: boolean
  }
  infiniteScroll: InfiniteScroll
  minTime: YearMonth
  maxTime: YearMonth
  getUseDebounce: <T>() => UseDebounce<T>
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

export interface StatsResult {
  stats: StyleStats | undefined
  isLoading: boolean
}

export interface GetStyleStatsIf {
  useStats: (params: StyleStatsQueryParams) => StatsResult
  minTime: YearMonth
  maxTime: YearMonth
  getUseDebounce: <T>() => UseDebounce<T>
}

export interface StatsIf {
  annual: GetAnnualStatsIf
  annualContainer: GetAnnualContainerStatsIf
  brewery: GetBreweryStatsIf
  container: GetContainerStatsIf
  location: GetLocationStatsIf
  overall: GetOverallStatsIf
  rating: GetRatingStatsIf
  style: GetStyleStatsIf
  setSearch: (mode: string, state: Record<string, string>) => Promise<void>
}
