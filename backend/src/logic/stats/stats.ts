import type { ValidatePagination } from '../pagination.js'
import type { ListDirection } from '../list.js'

export type AnnualStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export type AnnualContainerStats = Array<{
  containerId: string
  containerSize: string
  containerType: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  year: string
}>

export type BreweryCountryStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewedBeerCount: string
  breweryCount: string
  countryCode: string
}>

export type BreweryStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewedBeerCount: string
  breweryId: string
  breweryName: string
  breweryCountry: string | undefined
}>

export type ContainerStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  containerId: string
  containerSize: string
  containerType: string
}>

export type LocationStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  locationId: string
  locationName: string
}>

type BreweryCountryStatsOrderProperty =
  'average' | 'brewery_count' | 'count' | 'country_code' | 'std_dev'

export interface BreweryCountryStatsOrder {
  property: BreweryCountryStatsOrderProperty
  direction: ListDirection
}

type BreweryStatsOrderProperty =
  'average' | 'brewery_name' | 'count' | 'std_dev'

export interface BreweryStatsOrder {
  property: BreweryStatsOrderProperty
  direction: ListDirection
}

type LocationStatsOrderProperty =
  'average' | 'location_name' | 'count' | 'std_dev'

export interface LocationStatsOrder {
  property: LocationStatsOrderProperty
  direction: ListDirection
}

export interface OverallStats {
  beerCount: string
  breweryCount: string
  breweryCountryCount: string
  containerCount: string
  locationCount: string
  distinctBeerReviewCount: string
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  reviewWithLocationCount: string
  reviewWithoutLocationCount: string
  styleCount: string
}

export type RatingStats = Array<{
  rating: string
  count: string
}>

export interface StatsIdFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
}

export interface StatsFilter {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
  maxReviewCount: number
  minReviewCount: number
  maxReviewAverage: number
  minReviewAverage: number
  timeStart: Date | undefined
  timeEnd: Date | undefined
}

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  styleId: string
  styleName: string
}>

type StyleStatsOrderProperty = 'average' | 'style_name' | 'count' | 'std_dev'

export interface StyleStatsOrder {
  property: StyleStatsOrderProperty
  direction: ListDirection
}

export interface StatsIdFilterQuery {
  brewery: string | undefined
  location: string | undefined
  style: string | undefined
}

export interface StatsFilterQuery extends StatsIdFilterQuery {
  minReviewCount: string | undefined
  maxReviewCount: string | undefined
  minReviewAverage: string | undefined
  maxReviewAverage: string | undefined
  timeStart: string | undefined
  timeEnd: string | undefined
}

export interface StatsOrderQuery {
  order: string | undefined
  direction: string | undefined
}

export interface OrderedStatsQuery extends StatsFilterQuery, StatsOrderQuery {}

type StatsIdFilterValidationResult =
  | {
      errorCode: 'invalid-id-filter'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StatsIdFilter
    }

export type ValidateStatsIdFilter = (
  query: StatsIdFilterQuery,
) => StatsIdFilterValidationResult

type StatsFilterValidationResult =
  | {
      errorCode: 'invalid-id-filter'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StatsFilter
    }

export type ValidateStatsFilter = (
  query: StatsFilterQuery,
) => StatsFilterValidationResult

export type ValidateBreweryCountryStatsOrder = (query: StatsOrderQuery) =>
  | {
      errorCode: 'invalid-brewery-country-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: BreweryCountryStatsOrder
    }

export type ValidateBreweryStatsOrder = (query: StatsOrderQuery) =>
  | {
      errorCode: 'invalid-brewery-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: BreweryStatsOrder
    }

export type ValidateLocationStatsOrder = (query: StatsOrderQuery) =>
  | {
      errorCode: 'invalid-location-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: LocationStatsOrder
    }

export type ValidateStyleStatsOrder = (query: StatsOrderQuery) =>
  | {
      errorCode: 'invalid-style-stats-query'
      result: undefined
    }
  | {
      errorCode: undefined
      result: StyleStatsOrder
    }

export interface ValidateAnnualContainerStats {
  pagination: ValidatePagination
  filter: ValidateStatsIdFilter
}

export interface ValidateBreweryStats {
  pagination: ValidatePagination
  filter: ValidateStatsFilter
  order: ValidateBreweryStatsOrder
}

export interface ValidateBreweryCountryStats {
  pagination: ValidatePagination
  filter: ValidateStatsFilter
  order: ValidateBreweryCountryStatsOrder
}

export interface ValidateLocationStats {
  pagination: ValidatePagination
  filter: ValidateStatsFilter
  order: ValidateLocationStatsOrder
}

export interface ValidateStyleStats {
  filter: ValidateStatsFilter
  order: ValidateStyleStatsOrder
}
