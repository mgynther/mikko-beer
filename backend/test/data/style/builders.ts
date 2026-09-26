import type { NewStyle } from '../../../src/data/style/style.repository.js'

// A valid NewStyle and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewStyle(overrides: Partial<NewStyle> = {}): NewStyle {
  return {
    name: 'Style',
    ...overrides,
  }
}
