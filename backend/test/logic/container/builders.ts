import type {
  Container,
  CreateContainerRequest,
  UpdateContainerRequest,
} from '../../../src/logic/container/container.js'

// A valid Container and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildContainer(overrides: Partial<Container> = {}): Container {
  return {
    id: '4ad585ce-01ba-4e12-92ad-d028038c815c',
    type: 'bottle',
    size: '0.33',
    ...overrides,
  }
}

// A valid CreateContainerRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateContainerRequest(
  overrides: Partial<CreateContainerRequest> = {},
): CreateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33',
    ...overrides,
  }
}

// A valid UpdateContainerRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateContainerRequest(
  overrides: Partial<UpdateContainerRequest> = {},
): UpdateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33',
    ...overrides,
  }
}
