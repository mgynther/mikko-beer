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
