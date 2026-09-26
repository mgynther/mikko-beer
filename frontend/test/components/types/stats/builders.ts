import type { OverallStats } from '../../../../src/components/types/stats/types'

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
