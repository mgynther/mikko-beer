import type {
  AnnualContainerStatsQueryParams,
  BreweryCountryStatsQueryParams,
  BreweryStatsQueryParams,
  IdParams,
  LocationStatsQueryParams,
  OverallStats,
  StyleStatsQueryParams,
} from '../../../src/storehooks/stats/types'

// A valid IdParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildIdParams(overrides: Partial<IdParams> = {}): IdParams {
  return {
    breweryId: undefined,
    locationId: undefined,
    styleId: undefined,
    ...overrides,
  }
}

// A valid AnnualContainerStatsQueryParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildAnnualContainerStatsQueryParams(
  overrides: Partial<AnnualContainerStatsQueryParams> = {},
): AnnualContainerStatsQueryParams {
  return {
    ...buildIdParams(),
    pagination: { size: 10, skip: 0 },
    ...overrides,
  }
}

// A valid BreweryCountryStatsQueryParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBreweryCountryStatsQueryParams(
  overrides: Partial<BreweryCountryStatsQueryParams> = {},
): BreweryCountryStatsQueryParams {
  return {
    ...buildIdParams(),
    pagination: { size: 10, skip: 0 },
    sorting: { order: 'average', direction: 'asc' },
    minReviewCount: 1,
    maxReviewCount: 100,
    minReviewAverage: 4,
    maxReviewAverage: 10,
    timeStart: 1512086400000,
    timeEnd: 1735689599000,
    ...overrides,
  }
}

// A valid BreweryStatsQueryParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBreweryStatsQueryParams(
  overrides: Partial<BreweryStatsQueryParams> = {},
): BreweryStatsQueryParams {
  return {
    ...buildIdParams(),
    pagination: { size: 10, skip: 0 },
    sorting: { order: 'average', direction: 'asc' },
    minReviewCount: 1,
    maxReviewCount: 100,
    minReviewAverage: 4,
    maxReviewAverage: 10,
    timeStart: 1512086400000,
    timeEnd: 1735689599000,
    ...overrides,
  }
}

// A valid LocationStatsQueryParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildLocationStatsQueryParams(
  overrides: Partial<LocationStatsQueryParams> = {},
): LocationStatsQueryParams {
  return {
    ...buildIdParams(),
    pagination: { size: 10, skip: 0 },
    sorting: { order: 'average', direction: 'asc' },
    minReviewCount: 1,
    maxReviewCount: 100,
    minReviewAverage: 4,
    maxReviewAverage: 10,
    timeStart: 1512086400000,
    timeEnd: 1735689599000,
    ...overrides,
  }
}

// A valid StyleStatsQueryParams and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyleStatsQueryParams(
  overrides: Partial<StyleStatsQueryParams> = {},
): StyleStatsQueryParams {
  return {
    ...buildIdParams(),
    sorting: { order: 'average', direction: 'asc' },
    minReviewCount: 1,
    maxReviewCount: 100,
    minReviewAverage: 4,
    maxReviewAverage: 10,
    timeStart: 1512086400000,
    timeEnd: 1735689599000,
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
