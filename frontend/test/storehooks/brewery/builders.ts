import type { Brewery } from '../../../src/storehooks/brewery/types'

// A valid Brewery and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBrewery(overrides: Partial<Brewery> = {}): Brewery {
  return {
    id: '8a7b6c5d-4e3f-4210-9876-5a4b3c2d1e0f',
    name: 'Brewery',
    country: 'Finland',
    ...overrides,
  }
}
