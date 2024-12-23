import type {
  InfiniteScroll,
  ListDirection,
  Pagination
} from '../types'

export interface BreweryStyleParams {
  breweryId: string | undefined
  styleId: string | undefined
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  containerCount: string
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

export interface RatingStats {
  rating: Array<{
    rating: string
    count: string
  }>
}

export interface BreweryStatsQueryParams {
  breweryId: string | undefined
  styleId: string | undefined
  pagination: Pagination
  sorting: BreweryStatsSorting
  minReviewCount: number
  maxReviewCount: number
  minReviewAverage: number
  maxReviewAverage: number
}

export interface StyleStatsQueryParams {
  breweryId: string | undefined
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
  useStats: (params: BreweryStyleParams) => {
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

export interface GetOverallStatsIf {
  useStats: (params: BreweryStyleParams) => {
    stats: OverallStats | undefined
    isLoading: boolean
  }
}

export interface GetRatingStatsIf {
  useStats: (params: BreweryStyleParams) => {
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
  overall: GetOverallStatsIf
  rating: GetRatingStatsIf
  style: GetStyleStatsIf
}
