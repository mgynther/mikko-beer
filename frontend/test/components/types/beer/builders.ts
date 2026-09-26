import type { Beer } from '../../../../src/components/types/beer/types'

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
