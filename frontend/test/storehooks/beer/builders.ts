import type { Beer, BeerWithIds } from '../../../src/storehooks/beer/types'

// A valid Beer and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBeer(overrides: Partial<Beer> = {}): Beer {
  return {
    id: '2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819',
    name: 'Beer',
    breweries: [],
    styles: [],
    ...overrides,
  }
}

// A valid BeerWithIds and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBeerWithIds(
  overrides: Partial<BeerWithIds> = {},
): BeerWithIds {
  return {
    id: 'a1b2c3d4-e5f6-4708-9192-a3b4c5d6e7f8',
    name: 'Beer',
    breweries: [],
    styles: [],
    ...overrides,
  }
}
