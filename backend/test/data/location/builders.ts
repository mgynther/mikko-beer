import type { insertLocation } from '../../../src/data/location/location.repository.js'

type NewLocation = Parameters<typeof insertLocation>[1]

// A valid location to insert and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewLocation(
  overrides: Partial<NewLocation> = {},
): NewLocation {
  return {
    name: 'Location',
    ...overrides,
  }
}
