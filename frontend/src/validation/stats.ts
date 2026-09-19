import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'

// This layer's own view of valid statistics, declared here rather than
// imported from types/. See the comment in style.ts. Every count and average
// is a string: they arrive as the backend formatted them and are not numbers
// until something decides how to read them.
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

const ValidatedOverallStats = t.type({
  beerCount: t.string,
  breweryCount: t.string,
  breweryCountryCount: t.string,
  containerCount: t.string,
  locationCount: t.string,
  distinctBeerReviewCount: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  reviewWithLocationCount: t.string,
  reviewWithoutLocationCount: t.string,
  styleCount: t.string,
})

const ValidatedOneAnnualStats = t.type({
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  year: t.string,
})

const ValidatedAnnualStats = t.type({
  annual: t.array(ValidatedOneAnnualStats),
})

const ValidatedOneAnnualContainerStats = t.type({
  containerId: t.string,
  containerSize: t.string,
  containerType: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  year: t.string,
})

const ValidatedAnnualContainerStats = t.type({
  annualContainer: t.array(ValidatedOneAnnualContainerStats),
})

const ValidatedOneBreweryCountryStats = t.type({
  countryCode: t.string,
  breweryCount: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  reviewedBeerCount: t.string,
})

const ValidatedBreweryCountryStats = t.type({
  breweryCountry: t.array(ValidatedOneBreweryCountryStats),
})

const ValidatedOneBreweryStats = t.type({
  breweryId: t.string,
  breweryName: t.string,
  breweryCountry: t.union([t.string, t.undefined]),
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  reviewedBeerCount: t.string,
})

const ValidatedBreweryStats = t.type({
  brewery: t.array(ValidatedOneBreweryStats),
})

const ValidatedOneContainerStats = t.type({
  containerId: t.string,
  containerSize: t.string,
  containerType: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
})

const ValidatedContainerStats = t.type({
  container: t.array(ValidatedOneContainerStats),
})

const ValidatedOneLocationStats = t.type({
  locationId: t.string,
  locationName: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
})

const ValidatedLocationStats = t.type({
  location: t.array(ValidatedOneLocationStats),
})

const ValidatedOneRatingStats = t.type({
  rating: t.string,
  count: t.string,
})

const ValidatedRatingStats = t.type({
  rating: t.array(ValidatedOneRatingStats),
})

const ValidatedOneStyleStats = t.type({
  reviewAverage: t.string,
  reviewCount: t.string,
  reviewMedian: t.string,
  reviewMode: t.string,
  reviewStandardDeviation: t.string,
  styleId: t.string,
  styleName: t.string,
})

const ValidatedStyleStats = t.type({
  style: t.array(ValidatedOneStyleStats),
})

function toOverallStats(
  stats: t.TypeOf<typeof ValidatedOverallStats>,
): OverallStats {
  return {
    beerCount: stats.beerCount,
    breweryCount: stats.breweryCount,
    breweryCountryCount: stats.breweryCountryCount,
    containerCount: stats.containerCount,
    locationCount: stats.locationCount,
    distinctBeerReviewCount: stats.distinctBeerReviewCount,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    reviewWithLocationCount: stats.reviewWithLocationCount,
    reviewWithoutLocationCount: stats.reviewWithoutLocationCount,
    styleCount: stats.styleCount,
  }
}

function toOneAnnualStats(
  stats: t.TypeOf<typeof ValidatedOneAnnualStats>,
): OneAnnualStats {
  return {
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    year: stats.year,
  }
}

function toOneAnnualContainerStats(
  stats: t.TypeOf<typeof ValidatedOneAnnualContainerStats>,
): OneAnnualContainerStats {
  return {
    containerId: stats.containerId,
    containerSize: stats.containerSize,
    containerType: stats.containerType,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    year: stats.year,
  }
}

function toOneBreweryCountryStats(
  stats: t.TypeOf<typeof ValidatedOneBreweryCountryStats>,
): OneBreweryCountryStats {
  return {
    countryCode: stats.countryCode,
    breweryCount: stats.breweryCount,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    reviewedBeerCount: stats.reviewedBeerCount,
  }
}

// A country missing from the response is an explicit undefined from here on,
// so that no layer can forget to pass it along.
function toOneBreweryStats(
  stats: t.TypeOf<typeof ValidatedOneBreweryStats>,
): OneBreweryStats {
  return {
    breweryId: stats.breweryId,
    breweryName: stats.breweryName,
    breweryCountry: stats.breweryCountry,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    reviewedBeerCount: stats.reviewedBeerCount,
  }
}

function toOneContainerStats(
  stats: t.TypeOf<typeof ValidatedOneContainerStats>,
): OneContainerStats {
  return {
    containerId: stats.containerId,
    containerSize: stats.containerSize,
    containerType: stats.containerType,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
  }
}

function toOneLocationStats(
  stats: t.TypeOf<typeof ValidatedOneLocationStats>,
): OneLocationStats {
  return {
    locationId: stats.locationId,
    locationName: stats.locationName,
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
  }
}

function toOneRatingStats(
  stats: t.TypeOf<typeof ValidatedOneRatingStats>,
): OneRatingStats {
  return {
    rating: stats.rating,
    count: stats.count,
  }
}

function toOneStyleStats(
  stats: t.TypeOf<typeof ValidatedOneStyleStats>,
): OneStyleStats {
  return {
    reviewAverage: stats.reviewAverage,
    reviewCount: stats.reviewCount,
    reviewMedian: stats.reviewMedian,
    reviewMode: stats.reviewMode,
    reviewStandardDeviation: stats.reviewStandardDeviation,
    styleId: stats.styleId,
    styleName: stats.styleName,
  }
}

export function validateOverallStatsOrUndefined(
  result: unknown,
): OverallStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedOverallStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toOverallStats(decoded.right)
}

export function validateAnnualStatsOrUndefined(
  result: unknown,
): AnnualStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedAnnualStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    annual: decoded.right.annual.map(toOneAnnualStats),
  }
}

export function validateAnnualContainerStatsOrUndefined(
  result: unknown,
): AnnualContainerStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateAnnualContainerStats(result)
}

export function validateAnnualContainerStats(
  result: unknown,
): AnnualContainerStats {
  const decoded = ValidatedAnnualContainerStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    annualContainer: decoded.right.annualContainer.map(
      toOneAnnualContainerStats,
    ),
  }
}

export function validateBreweryCountryStatsOrUndefined(
  result: unknown,
): BreweryCountryStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBreweryCountryStats(result)
}

export function validateBreweryCountryStats(
  result: unknown,
): BreweryCountryStats {
  const decoded = ValidatedBreweryCountryStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    breweryCountry: decoded.right.breweryCountry.map(toOneBreweryCountryStats),
  }
}

export function validateBreweryStatsOrUndefined(
  result: unknown,
): BreweryStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateBreweryStats(result)
}

export function validateBreweryStats(result: unknown): BreweryStats {
  const decoded = ValidatedBreweryStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    brewery: decoded.right.brewery.map(toOneBreweryStats),
  }
}

export function validateContainerStatsOrUndefined(
  result: unknown,
): ContainerStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedContainerStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    container: decoded.right.container.map(toOneContainerStats),
  }
}

export function validateLocationStats(result: unknown): LocationStats {
  const decoded = ValidatedLocationStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    location: decoded.right.location.map(toOneLocationStats),
  }
}

export function validateLocationStatsOrUndefined(
  result: unknown,
): LocationStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateLocationStats(result)
}

export function validateRatingStatsOrUndefined(
  result: unknown,
): RatingStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedRatingStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    rating: decoded.right.rating.map(toOneRatingStats),
  }
}

export function validateStyleStatsOrUndefined(
  result: unknown,
): StyleStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  const decoded = ValidatedStyleStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    style: decoded.right.style.map(toOneStyleStats),
  }
}
