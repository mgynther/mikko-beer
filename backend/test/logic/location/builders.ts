import type {
  CreateLocationRequest,
  Location,
  UpdateLocationRequest,
} from '../../../src/logic/location/location.js'

// A valid Location and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: '9dd2ebbc-110d-4391-937a-69fb0760251e',
    name: 'Location',
    ...overrides,
  }
}

// A valid CreateLocationRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateLocationRequest(
  overrides: Partial<CreateLocationRequest> = {},
): CreateLocationRequest {
  return {
    name: 'Location',
    ...overrides,
  }
}

// A valid UpdateLocationRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateLocationRequest(
  overrides: Partial<UpdateLocationRequest> = {},
): UpdateLocationRequest {
  return {
    name: 'Location',
    ...overrides,
  }
}
