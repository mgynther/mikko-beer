import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryCountryStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StatsFilter,
  StatsIdFilter,
  StyleStats,
} from '../../../src/logic/stats/stats.js'

// A valid StatsIdFilter and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStatsIdFilter(
  overrides: Partial<StatsIdFilter> = {},
): StatsIdFilter {
  return {
    brewery: undefined,
    location: undefined,
    style: undefined,
    ...overrides,
  }
}

// A valid StatsFilter and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStatsFilter(
  overrides: Partial<StatsFilter> = {},
): StatsFilter {
  return {
    ...buildStatsIdFilter(),
    maxReviewCount: 100,
    minReviewCount: 1,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    timeStart: undefined,
    timeEnd: undefined,
    ...overrides,
  }
}

// A valid OverallStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildOverallStats(
  overrides: Partial<OverallStats> = {},
): OverallStats {
  return {
    beerCount: '482',
    breweryCount: '91',
    breweryCountryCount: '12',
    containerCount: '7',
    locationCount: '14',
    distinctBeerReviewCount: '401',
    reviewAverage: '8.25',
    reviewCount: '512',
    reviewMedian: '8.00',
    reviewMode: '8',
    reviewStandardDeviation: '0.86',
    reviewWithLocationCount: '198',
    reviewWithoutLocationCount: '314',
    styleCount: '33',
    ...overrides,
  }
}

// A valid row of AnnualStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildAnnualStatsRow(
  overrides: Partial<AnnualStats[number]> = {},
): AnnualStats[number] {
  return {
    reviewAverage: '8.23',
    reviewCount: '234',
    reviewStandardDeviation: '0.91',
    reviewMedian: '8.00',
    reviewMode: '8',
    year: '2023',
    ...overrides,
  }
}

// A valid row of AnnualContainerStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildAnnualContainerStatsRow(
  overrides: Partial<AnnualContainerStats[number]> = {},
): AnnualContainerStats[number] {
  return {
    containerId: '34ce0e84-5cc5-4cc6-a0b7-dce77d90a297',
    containerType: 'bottle',
    containerSize: '0.33',
    reviewAverage: '8.23',
    reviewCount: '234',
    reviewStandardDeviation: '0.91',
    reviewMedian: '8.00',
    reviewMode: '8',
    year: '2023',
    ...overrides,
  }
}

// A valid row of BreweryStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBreweryStatsRow(
  overrides: Partial<BreweryStats[number]> = {},
): BreweryStats[number] {
  return {
    reviewAverage: '9.08',
    reviewCount: '64',
    reviewStandardDeviation: '0.62',
    reviewMedian: '9.00',
    reviewMode: '9',
    reviewedBeerCount: '63',
    breweryId: 'cce07f3d-7f96-4f6c-8fe4-b9778a3a2c8f',
    breweryName: 'Brewery',
    breweryCountry: undefined,
    ...overrides,
  }
}

// A valid row of BreweryCountryStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBreweryCountryStatsRow(
  overrides: Partial<BreweryCountryStats[number]> = {},
): BreweryCountryStats[number] {
  return {
    reviewAverage: '8.91',
    reviewCount: '76',
    reviewStandardDeviation: '0.64',
    reviewMedian: '9.00',
    reviewMode: '9',
    reviewedBeerCount: '61',
    breweryCount: '14',
    countryCode: 'FI',
    ...overrides,
  }
}

// A valid row of ContainerStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildContainerStatsRow(
  overrides: Partial<ContainerStats[number]> = {},
): ContainerStats[number] {
  return {
    reviewAverage: '8.43',
    reviewCount: '212',
    reviewStandardDeviation: '0.82',
    reviewMedian: '8.50',
    reviewMode: '8',
    containerId: 'd6d08249-1948-4fa1-8c84-d89a1f5ba3e5',
    containerSize: '0.33',
    containerType: 'bottle',
    ...overrides,
  }
}

// A valid row of LocationStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildLocationStatsRow(
  overrides: Partial<LocationStats[number]> = {},
): LocationStats[number] {
  return {
    reviewAverage: '9.08',
    reviewCount: '64',
    reviewStandardDeviation: '0.62',
    reviewMedian: '9.00',
    reviewMode: '9',
    locationId: '8b996850-85b6-4754-b7dd-ba33a1e0f41c',
    locationName: 'Location',
    ...overrides,
  }
}

// A valid row of RatingStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildRatingStatsRow(
  overrides: Partial<RatingStats[number]> = {},
): RatingStats[number] {
  return {
    rating: '8',
    count: '15',
    ...overrides,
  }
}

// A valid row of StyleStats and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyleStatsRow(
  overrides: Partial<StyleStats[number]> = {},
): StyleStats[number] {
  return {
    reviewAverage: '9.12',
    reviewCount: '58',
    reviewStandardDeviation: '0.58',
    reviewMedian: '9.00',
    reviewMode: '9',
    styleId: 'b0aa1b49-d67a-4760-8a41-ce5d817520d0',
    styleName: 'Style',
    ...overrides,
  }
}
