import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest,
} from '../../../src/logic/brewery/brewery.js'

// A valid Brewery and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBrewery(overrides: Partial<Brewery> = {}): Brewery {
  return {
    id: '71886b01-da24-41a0-9d98-6d485f2bb166',
    name: 'Brewery',
    country: undefined,
    ...overrides,
  }
}

// A valid CreateBreweryRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateBreweryRequest(
  overrides: Partial<CreateBreweryRequest> = {},
): CreateBreweryRequest {
  return {
    name: 'Brewery',
    country: undefined,
    ...overrides,
  }
}

// A valid UpdateBreweryRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateBreweryRequest(
  overrides: Partial<UpdateBreweryRequest> = {},
): UpdateBreweryRequest {
  return {
    name: 'Brewery',
    country: undefined,
    ...overrides,
  }
}
