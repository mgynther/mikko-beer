import type { Location } from '../../../src/storehooks/location/types'

// A valid Location and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'f1e2d3c4-b5a6-4978-8f0e-1d2c3b4a5968',
    name: 'Location',
    ...overrides,
  }
}
