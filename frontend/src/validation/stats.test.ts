import { expect, test } from 'vitest'

import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StyleStats
} from '../core/stats/types'

import {
  validateAnnualContainerStatsOrUndefined,
  validateAnnualStatsOrUndefined,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStats,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined
} from './stats'

// Overall
const validOverall: OverallStats = {
  beerCount: '482',
  breweryCount: '91',
  containerCount: '7',
  locationCount: '14',
  distinctBeerReviewCount: '401',
  reviewAverage: '8.25',
  reviewCount: '512',
  styleCount: '33'
}

test('validateOverallStatsOrUndefined passes undefined', () => {
  const result = validateOverallStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateOverallStatsOrUndefined passes valid', () => {
  const result = validateOverallStatsOrUndefined(validOverall)
  expect(result).toEqual(validOverall)
})

test('validateOverallStatsOrUndefined throws invalid', () => {
  expect(() => validateOverallStatsOrUndefined({
    beerCount: 482
  })).toThrow()
})

// Annual
const validAnnual: AnnualStats = {
  annual: [{
    reviewAverage: '7.89',
    reviewCount: '105',
    year: '2023'
  }]
}

test('validateAnnualStatsOrUndefined passes undefined', () => {
  const result = validateAnnualStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateAnnualStatsOrUndefined passes valid', () => {
  const result = validateAnnualStatsOrUndefined(validAnnual)
  expect(result).toEqual(validAnnual)
})

test('validateAnnualStatsOrUndefined throws invalid', () => {
  expect(() => validateAnnualStatsOrUndefined({
    annual: [{ reviewCount: 105 }]
  })).toThrow()
})

// AnnualContainer
const validAnnualContainer: AnnualContainerStats = {
  annualContainer: [{
    containerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '8.12',
    reviewCount: '42',
    year: '2024'
  }]
}

test('validateAnnualContainerStatsOrUndefined passes undefined', () => {
  const result = validateAnnualContainerStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateAnnualContainerStatsOrUndefined passes valid', () => {
  const result = validateAnnualContainerStatsOrUndefined(validAnnualContainer)
  expect(result).toEqual(validAnnualContainer)
})

test('validateAnnualContainerStatsOrUndefined throws invalid', () => {
  expect(() => validateAnnualContainerStatsOrUndefined({
    annualContainer: [{ containerId: 123 }]
  })).toThrow()
})

// Brewery
const validBrewery: BreweryStats = {
  brewery: [{
    breweryId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    breweryName: 'Test Brewery',
    reviewAverage: '9.01',
    reviewCount: '67',
    reviewedBeerCount: '23'
  }]
}

test('validateBreweryStatsOrUndefined passes undefined', () => {
  const result = validateBreweryStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateBreweryStatsOrUndefined passes valid', () => {
  const result = validateBreweryStatsOrUndefined(validBrewery)
  expect(result).toEqual(validBrewery)
})

test('validateBreweryStatsOrUndefined throws invalid', () => {
  expect(() => validateBreweryStatsOrUndefined({
    brewery: [{ breweryId: 123 }]
  })).toThrow()
})

// Container
const validContainer: ContainerStats = {
  container: [{
    containerId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    containerSize: '0.50',
    containerType: 'can',
    reviewAverage: '7.55',
    reviewCount: '88'
  }]
}

test('validateContainerStatsOrUndefined passes undefined', () => {
  const result = validateContainerStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateContainerStatsOrUndefined passes valid', () => {
  const result = validateContainerStatsOrUndefined(validContainer)
  expect(result).toEqual(validContainer)
})

test('validateContainerStatsOrUndefined throws invalid', () => {
  expect(() => validateContainerStatsOrUndefined({
    container: [{ containerId: 123 }]
  })).toThrow()
})

// Location
const validLocation: LocationStats = {
  location: [{
    locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    locationName: 'Pub Kultainen Apina',
    reviewAverage: '8.44',
    reviewCount: '156'
  }]
}

test('validateLocationStats passes valid', () => {
  const result = validateLocationStats(validLocation)
  expect(result).toEqual(validLocation)
})

test('validateLocationStats throws invalid', () => {
  expect(() => validateLocationStats({
    location: [{ locationId: 123 }]
  })).toThrow()
})

test('validateLocationStatsOrUndefined passes undefined', () => {
  const result = validateLocationStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateLocationStatsOrUndefined passes valid', () => {
  const result = validateLocationStatsOrUndefined(validLocation)
  expect(result).toEqual(validLocation)
})

test('validateLocationStatsOrUndefined throws invalid', () => {
  expect(() => validateLocationStatsOrUndefined({
    location: [{ locationId: 123 }]
  })).toThrow()
})

// Rating
const validRating: RatingStats = {
  rating: [{
    rating: '10',
    count: '45'
  }]
}

test('validateRatingStatsOrUndefined passes undefined', () => {
  const result = validateRatingStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateRatingStatsOrUndefined passes valid', () => {
  const result = validateRatingStatsOrUndefined(validRating)
  expect(result).toEqual(validRating)
})

test('validateRatingStatsOrUndefined throws invalid', () => {
  expect(() => validateRatingStatsOrUndefined({
    rating: [{ rating: 10 }]
  })).toThrow()
})

// Style
const validStyle: StyleStats = {
  style: [{
    reviewAverage: '8.77',
    reviewCount: '39',
    styleId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    styleName: 'IPA'
  }]
}

test('validateStyleStatsOrUndefined passes undefined', () => {
  const result = validateStyleStatsOrUndefined(undefined)
  expect(result).toEqual(undefined)
})

test('validateStyleStatsOrUndefined passes valid', () => {
  const result = validateStyleStatsOrUndefined(validStyle)
  expect(result).toEqual(validStyle)
})

test('validateStyleStatsOrUndefined throws invalid', () => {
  expect(() => validateStyleStatsOrUndefined({
    style: [{ styleId: 123 }]
  })).toThrow()
})
