import { test } from '../test'
import { assertDeepEqual, assertEqual, assertThrows } from '../assert'

import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryCountryStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StyleStats,
} from '../../src/validation/stats'

import {
  validateAnnualContainerStats,
  validateAnnualContainerStatsOrUndefined,
  validateAnnualStatsOrUndefined,
  validateBreweryCountryStats,
  validateBreweryCountryStatsOrUndefined,
  validateBreweryStats,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStats,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined,
} from '../../src/validation/stats'

// Overall
const validOverall: OverallStats = {
  beerCount: '482',
  breweryCount: '91',
  breweryCountryCount: '12',
  containerCount: '7',
  locationCount: '14',
  distinctBeerReviewCount: '401',
  reviewAverage: '8.25',
  reviewCount: '512',
  reviewMedian: '8.50',
  reviewMode: '9',
  reviewStandardDeviation: '0.57',
  reviewWithLocationCount: '198',
  reviewWithoutLocationCount: '314',
  styleCount: '33',
}

test('validateOverallStatsOrUndefined passes undefined', () => {
  const result = validateOverallStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateOverallStatsOrUndefined passes valid', () => {
  const result = validateOverallStatsOrUndefined(validOverall)
  assertDeepEqual(result, validOverall)
})

test('validateOverallStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateOverallStatsOrUndefined({
      beerCount: 482,
    }),
  )
})

// Annual
const validAnnual: AnnualStats = {
  annual: [
    {
      reviewAverage: '7.89',
      reviewCount: '105',
      reviewMedian: '9.00',
      reviewMode: '9',
      reviewStandardDeviation: '0.47',
      year: '2023',
    },
  ],
}

test('validateAnnualStatsOrUndefined passes undefined', () => {
  const result = validateAnnualStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateAnnualStatsOrUndefined passes valid', () => {
  const result = validateAnnualStatsOrUndefined(validAnnual)
  assertDeepEqual(result, validAnnual)
})

test('validateAnnualStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateAnnualStatsOrUndefined({
      annual: [{ reviewCount: 105 }],
    }),
  )
})

// AnnualContainer
const validAnnualContainer: AnnualContainerStats = {
  annualContainer: [
    {
      containerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      containerSize: '0.33',
      containerType: 'bottle',
      reviewAverage: '8.12',
      reviewCount: '42',
      reviewMedian: '8.00',
      reviewMode: '8',
      reviewStandardDeviation: '0.83',
      year: '2024',
    },
  ],
}

test('validateAnnualContainerStatsOrUndefined passes undefined', () => {
  const result = validateAnnualContainerStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateAnnualContainerStatsOrUndefined passes valid', () => {
  const result = validateAnnualContainerStatsOrUndefined(validAnnualContainer)
  assertDeepEqual(result, validAnnualContainer)
})

test('validateAnnualContainerStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateAnnualContainerStatsOrUndefined({
      annualContainer: [{ containerId: 123 }],
    }),
  )
})

test('validateAnnualContainerStats passes valid', () => {
  const result = validateAnnualContainerStats(validAnnualContainer)
  assertDeepEqual(result, validAnnualContainer)
})

test('validateAnnualContainerStats throws invalid', () => {
  assertThrows(() =>
    validateAnnualContainerStats({
      annualContainer: [{ containerId: 123 }],
    }),
  )
})

// Brewery country
const validBreweryCountry: BreweryCountryStats = {
  breweryCountry: [
    {
      countryCode: 'FI',
      breweryCount: '12',
      reviewAverage: '9.01',
      reviewCount: '67',
      reviewMedian: '8.50',
      reviewMode: '9',
      reviewStandardDeviation: '0.57',
      reviewedBeerCount: '23',
    },
  ],
}

test('validateBreweryCountryStatsOrUndefined passes undefined', () => {
  const result = validateBreweryCountryStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateBreweryCountryStatsOrUndefined passes valid', () => {
  const result = validateBreweryCountryStatsOrUndefined(validBreweryCountry)
  assertDeepEqual(result, validBreweryCountry)
})

test('validateBreweryCountryStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateBreweryCountryStatsOrUndefined({
      breweryCountry: [{ countryCode: 358 }],
    }),
  )
})

test('validateBreweryCountryStats passes valid', () => {
  const result = validateBreweryCountryStats(validBreweryCountry)
  assertDeepEqual(result, validBreweryCountry)
})

test('validateBreweryCountryStats throws invalid', () => {
  assertThrows(() =>
    validateBreweryCountryStats({
      breweryCountry: [{ countryCode: 358 }],
    }),
  )
})

test('validateBreweryCountryStats throws for missing brewery count', () => {
  const { breweryCount, ...withoutBreweryCount } =
    validBreweryCountry.breweryCountry[0]
  assertEqual(breweryCount, '12')
  assertThrows(() =>
    validateBreweryCountryStats({ breweryCountry: [withoutBreweryCount] }),
  )
})

// Brewery
const validBrewery: BreweryStats = {
  brewery: [
    {
      breweryId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      breweryName: 'Test Brewery',
      breweryCountry: undefined,
      reviewAverage: '9.01',
      reviewCount: '67',
      reviewMedian: '8.50',
      reviewMode: '9',
      reviewStandardDeviation: '0.57',
      reviewedBeerCount: '23',
    },
  ],
}

test('validateBreweryStatsOrUndefined passes undefined', () => {
  const result = validateBreweryStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateBreweryStatsOrUndefined passes valid', () => {
  const result = validateBreweryStatsOrUndefined(validBrewery)
  assertDeepEqual(result, validBrewery)
})

test('validateBreweryStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateBreweryStatsOrUndefined({
      brewery: [{ breweryId: 123 }],
    }),
  )
})

test('validateBreweryStats passes valid', () => {
  const result = validateBreweryStats(validBrewery)
  assertDeepEqual(result, validBrewery)
})

test('validateBreweryStats throws invalid', () => {
  assertThrows(() =>
    validateBreweryStats({
      brewery: [{ breweryId: 123 }],
    }),
  )
})

test('validateBreweryStats passes country', () => {
  const stats: BreweryStats = {
    brewery: [
      {
        ...validBrewery.brewery[0],
        breweryCountry: 'FI',
      },
    ],
  }
  assertDeepEqual(validateBreweryStats(stats), stats)
})

test('validateBreweryStats sets missing country explicitly undefined', () => {
  const result = validateBreweryStats({
    brewery: [
      {
        breweryId: 'd90a4f4e-2f4b-4a0e-bb3e-0a7f4e0a6b58',
        breweryName: 'Test Brewery',
        reviewAverage: '9.01',
        reviewCount: '67',
        reviewMedian: '8.50',
        reviewMode: '9',
        reviewStandardDeviation: '0.57',
        reviewedBeerCount: '23',
      },
    ],
  })
  const brewery = result.brewery[0]
  assertEqual(Object.keys(brewery).includes('breweryCountry'), true)
  assertEqual(brewery.breweryCountry, undefined)
})

test('validateBreweryStats throws for non-string country', () => {
  assertThrows(() =>
    validateBreweryStats({
      brewery: [
        {
          ...validBrewery.brewery[0],
          breweryCountry: 358,
        },
      ],
    }),
  )
})

test('validateOverallStatsOrUndefined throws for missing country count', () => {
  const { breweryCountryCount, ...withoutCountryCount } = validOverall
  assertEqual(breweryCountryCount, '12')
  assertThrows(() => validateOverallStatsOrUndefined(withoutCountryCount))
})

// Container
const validContainer: ContainerStats = {
  container: [
    {
      containerId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      containerSize: '0.50',
      containerType: 'can',
      reviewAverage: '7.55',
      reviewCount: '88',
      reviewMedian: '7.50',
      reviewMode: '8',
      reviewStandardDeviation: '0.68',
    },
  ],
}

test('validateContainerStatsOrUndefined passes undefined', () => {
  const result = validateContainerStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateContainerStatsOrUndefined passes valid', () => {
  const result = validateContainerStatsOrUndefined(validContainer)
  assertDeepEqual(result, validContainer)
})

test('validateContainerStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateContainerStatsOrUndefined({
      container: [{ containerId: 123 }],
    }),
  )
})

// Location
const validLocation: LocationStats = {
  location: [
    {
      locationId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      locationName: 'Pub Kultainen Apina',
      reviewAverage: '8.44',
      reviewCount: '156',
      reviewMedian: '8.00',
      reviewMode: '8',
      reviewStandardDeviation: '0.89',
    },
  ],
}

test('validateLocationStats passes valid', () => {
  const result = validateLocationStats(validLocation)
  assertDeepEqual(result, validLocation)
})

test('validateLocationStats throws invalid', () => {
  assertThrows(() =>
    validateLocationStats({
      location: [{ locationId: 123 }],
    }),
  )
})

test('validateLocationStatsOrUndefined passes undefined', () => {
  const result = validateLocationStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateLocationStatsOrUndefined passes valid', () => {
  const result = validateLocationStatsOrUndefined(validLocation)
  assertDeepEqual(result, validLocation)
})

test('validateLocationStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateLocationStatsOrUndefined({
      location: [{ locationId: 123 }],
    }),
  )
})

// Rating
const validRating: RatingStats = {
  rating: [
    {
      rating: '10',
      count: '45',
    },
  ],
}

test('validateRatingStatsOrUndefined passes undefined', () => {
  const result = validateRatingStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateRatingStatsOrUndefined passes valid', () => {
  const result = validateRatingStatsOrUndefined(validRating)
  assertDeepEqual(result, validRating)
})

test('validateRatingStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateRatingStatsOrUndefined({
      rating: [{ rating: 10 }],
    }),
  )
})

// Style
const validStyle: StyleStats = {
  style: [
    {
      reviewAverage: '8.77',
      reviewCount: '39',
      reviewMedian: '8.50',
      reviewMode: '9',
      reviewStandardDeviation: '0.66',
      styleId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      styleName: 'IPA',
    },
  ],
}

test('validateStyleStatsOrUndefined passes undefined', () => {
  const result = validateStyleStatsOrUndefined(undefined)
  assertDeepEqual(result, undefined)
})

test('validateStyleStatsOrUndefined passes valid', () => {
  const result = validateStyleStatsOrUndefined(validStyle)
  assertDeepEqual(result, validStyle)
})

test('validateStyleStatsOrUndefined throws invalid', () => {
  assertThrows(() =>
    validateStyleStatsOrUndefined({
      style: [{ styleId: 123 }],
    }),
  )
})
