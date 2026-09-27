import type { AuthorizedRequest, PaginationRequest } from '../request.js'

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

export type RatingStats = Array<{
  rating: string
  count: string
}>

export type StyleStats = Array<{
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
  styleId: string
  styleName: string
}>

export interface OverallStatsBody {
  overall: OverallStats
}

export interface AnnualStatsBody {
  annual: AnnualStats
}

export interface AnnualContainerStatsBody {
  annualContainer: AnnualContainerStats
}

export interface BreweryStatsBody {
  brewery: BreweryStats
}

export interface BreweryCountryStatsBody {
  breweryCountry: BreweryCountryStats
}

export interface ContainerStatsBody {
  container: ContainerStats
}

export interface LocationStatsBody {
  location: LocationStats
}

export interface RatingStatsBody {
  rating: RatingStats
}

export interface StyleStatsBody {
  style: StyleStats
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

export interface IdFilteredStatsRequest extends AuthorizedRequest {
  filter: StatsIdFilterQuery
}

export interface PaginatedIdFilteredStatsRequest extends PaginationRequest {
  filter: StatsIdFilterQuery
}

export interface OrderedStatsRequest extends AuthorizedRequest {
  filter: StatsFilterQuery
  order: StatsOrderQuery
}

export interface PaginatedOrderedStatsRequest extends PaginationRequest {
  filter: StatsFilterQuery
  order: StatsOrderQuery
}

export interface StatsHandlers {
  getOverall: (request: IdFilteredStatsRequest) => Promise<OverallStatsBody>
  getAnnual: (request: IdFilteredStatsRequest) => Promise<AnnualStatsBody>
  getAnnualContainer: (
    request: PaginatedIdFilteredStatsRequest,
  ) => Promise<AnnualContainerStatsBody>
  getBrewery: (
    request: PaginatedOrderedStatsRequest,
  ) => Promise<BreweryStatsBody>
  getBreweryCountry: (
    request: PaginatedOrderedStatsRequest,
  ) => Promise<BreweryCountryStatsBody>
  getContainer: (request: IdFilteredStatsRequest) => Promise<ContainerStatsBody>
  getLocation: (
    request: PaginatedOrderedStatsRequest,
  ) => Promise<LocationStatsBody>
  getRating: (request: IdFilteredStatsRequest) => Promise<RatingStatsBody>
  getStyle: (request: OrderedStatsRequest) => Promise<StyleStatsBody>
}
