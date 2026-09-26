import type { Container } from '../../../../src/components/types/container/types'

// A valid Container and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildContainer(overrides: Partial<Container> = {}): Container {
  return {
    id: '8c7d6e5f-4031-429a-9988-7a6b5c4d3e2f',
    type: 'bottle',
    size: '0.33',
    ...overrides,
  }
}
