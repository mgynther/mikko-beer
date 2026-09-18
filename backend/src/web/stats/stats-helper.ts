import {
  validateBreweryCountryStatsOrder as doValidateBreweryCountryStatsOrder,
  validateBreweryStatsOrder as doValidateBreweryStatsOrder,
  validateLocationStatsOrder as doValidateLocationStatsOrder,
  validateStatsFilter as doValidateStatsFilter,
  validateStatsIdFilter as doValidateStatsIdFilter,
  validateStyleStatsOrder as doValidateStyleStatsOrder,
} from '../../validation/stats.js'

import type {
  BreweryCountryStatsOrder,
  BreweryStatsOrder,
  LocationStatsOrder,
  StatsFilter,
  StatsIdFilter,
  StyleStatsOrder,
} from '../../logic/stats/stats.js'
import {
  invalidBreweryCountryStatsQueryError,
  invalidBreweryStatsQueryError,
  invalidIdFilterError,
  invalidLocationStatsQueryError,
  invalidStyleStatsQueryError,
} from '../../logic/errors.js'

export function validateStatsIdFilter(
  query: Record<string, unknown> | undefined,
): StatsIdFilter {
  const validationResult = doValidateStatsIdFilter(query)
  if (validationResult.errorCode === 'invalid-id-filter') {
    throw invalidIdFilterError
  }
  return validationResult.result
}

export function validateStatsFilter(
  query: Record<string, unknown> | undefined,
): StatsFilter {
  const validationResult = doValidateStatsFilter(query)
  if (validationResult.errorCode === 'invalid-id-filter') {
    throw invalidIdFilterError
  }
  return validationResult.result
}

export function validateBreweryCountryStatsOrder(
  query: Record<string, unknown>,
): BreweryCountryStatsOrder {
  const validationResult = doValidateBreweryCountryStatsOrder(query)
  if (validationResult.errorCode === 'invalid-brewery-country-stats-query') {
    throw invalidBreweryCountryStatsQueryError
  }
  return validationResult.result
}

export function validateBreweryStatsOrder(
  query: Record<string, unknown>,
): BreweryStatsOrder {
  const validationResult = doValidateBreweryStatsOrder(query)
  if (validationResult.errorCode === 'invalid-brewery-stats-query') {
    throw invalidBreweryStatsQueryError
  }
  return validationResult.result
}

export function validateLocationStatsOrder(
  query: Record<string, unknown>,
): LocationStatsOrder {
  const validationResult = doValidateLocationStatsOrder(query)
  if (validationResult.errorCode === 'invalid-location-stats-query') {
    throw invalidLocationStatsQueryError
  }
  return validationResult.result
}

export function validateStyleStatsOrder(
  query: Record<string, unknown>,
): StyleStatsOrder {
  const validationResult = doValidateStyleStatsOrder(query)
  if (validationResult.errorCode === 'invalid-style-stats-query') {
    throw invalidStyleStatsQueryError
  }
  return validationResult.result
}
