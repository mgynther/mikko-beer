import type { insertContainer } from '../../../src/data/container/container.repository.js'

type NewContainer = Parameters<typeof insertContainer>[1]

// A valid container to insert and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewContainer(
  overrides: Partial<NewContainer> = {},
): NewContainer {
  return {
    type: 'bottle',
    size: '0.33',
    ...overrides,
  }
}
