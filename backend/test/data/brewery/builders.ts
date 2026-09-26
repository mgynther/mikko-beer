import type { insertBrewery } from '../../../src/data/brewery/brewery.repository.js'

type NewBrewery = Parameters<typeof insertBrewery>[1]

// A valid brewery to insert and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewBrewery(
  overrides: Partial<NewBrewery> = {},
): NewBrewery {
  return {
    name: 'Brewery',
    country: undefined,
    ...overrides,
  }
}
