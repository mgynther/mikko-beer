import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  RatingStats,
  OverallStats,
  StyleStats
} from '../core/stats/types'

const ValidatedOverallStats = t.type({
  beerCount: t.string,
  breweryCount: t.string,
  containerCount: t.string,
  locationCount: t.string,
  distinctBeerReviewCount: t.string,
  reviewAverage: t.string,
  reviewCount: t.string,
  styleCount: t.string
})

const ValidatedAnnualStats = t.type({
  annual: t.array(
    t.type({
      reviewAverage: t.string,
      reviewCount: t.string,
      year: t.string
    }))
})

const ValidatedAnnualContainerStats = t.type({
  annualContainer: t.array(
    t.type({
      containerId: t.string,
      containerSize: t.string,
      containerType: t.string,
      reviewAverage: t.string,
      reviewCount: t.string,
      year: t.string
    }))
})

const ValidatedBreweryStats = t.type({
  brewery: t.array(
    t.type({
      breweryId: t.string,
      breweryName: t.string,
      reviewAverage: t.string,
      reviewCount: t.string
    }))
})

const ValidatedContainerStats = t.type({
  container: t.array(
    t.type({
      containerId: t.string,
      containerSize: t.string,
      containerType: t.string,
      reviewAverage: t.string,
      reviewCount: t.string
    }))
})

const ValidatedLocationStats = t.type({
  location: t.array(
    t.type({
      locationId: t.string,
      locationName: t.string,
      reviewAverage: t.string,
      reviewCount: t.string
    }))
})

const ValidatedRatingStats = t.type({
  rating: t.array(
    t.type({
      rating: t.string,
      count: t.string
    }))
})

const ValidatedStyleStats = t.type({
  style: t.array(
    t.type({
      reviewAverage: t.string,
      reviewCount: t.string,
      styleId: t.string,
      styleName: t.string
    }))
})

export function validateOverallStatsOrUndefined(
  result: unknown
): OverallStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedOverallStats>
  const decoded = ValidatedOverallStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateAnnualStatsOrUndefined(
  result: unknown
): AnnualStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedAnnualStats>
  const decoded = ValidatedAnnualStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateAnnualContainerStatsOrUndefined(
  result: unknown
): AnnualContainerStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedAnnualContainerStats>
  const decoded = ValidatedAnnualContainerStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateBreweryStatsOrUndefined(
  result: unknown
): BreweryStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedBreweryStats>
  const decoded = ValidatedBreweryStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateContainerStatsOrUndefined(
  result: unknown
): ContainerStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedContainerStats>
  const decoded = ValidatedContainerStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateLocationStatsOrUndefined(
  result: unknown
): LocationStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedLocationStats>
  const decoded = ValidatedLocationStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateRatingStatsOrUndefined(
  result: unknown
): RatingStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedRatingStats>
  const decoded = ValidatedRatingStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}

export function validateStyleStatsOrUndefined(
  result: unknown
): StyleStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  type StatsT = t.TypeOf<typeof ValidatedStyleStats>
  const decoded = ValidatedStyleStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StatsT = decoded.right
  return valid
}
