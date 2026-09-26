import type { NewBeer } from '../../../src/data/beer/beer.repository.js'

// A valid NewBeer and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewBeer(overrides: Partial<NewBeer> = {}): NewBeer {
  return {
    name: 'Beer',
    ...overrides,
  }
}
