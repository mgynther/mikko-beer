import type {
  Beer,
  BeerWithBreweriesAndStyles,
  CreateBeerRequest,
  UpdateBeerRequest,
} from '../../../src/logic/beer/beer.js'

// A valid Beer and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBeer(overrides: Partial<Beer> = {}): Beer {
  return {
    id: 'a519d6be-55e2-41b0-b062-a99328ff1d25',
    name: 'Beer',
    ...overrides,
  }
}

// A valid BeerWithBreweriesAndStyles and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildBeerWithBreweriesAndStyles(
  overrides: Partial<BeerWithBreweriesAndStyles> = {},
): BeerWithBreweriesAndStyles {
  return {
    id: 'b3d3f71e-c067-470c-81ae-a49f3740b96e',
    name: 'Beer',
    breweries: [],
    styles: [],
    ...overrides,
  }
}

// A valid CreateBeerRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateBeerRequest(
  overrides: Partial<CreateBeerRequest> = {},
): CreateBeerRequest {
  return {
    name: 'Beer',
    breweries: [],
    styles: [],
    ...overrides,
  }
}

// A valid UpdateBeerRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateBeerRequest(
  overrides: Partial<UpdateBeerRequest> = {},
): UpdateBeerRequest {
  return {
    name: 'Beer',
    breweries: [],
    styles: [],
    ...overrides,
  }
}
