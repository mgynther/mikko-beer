import type {
  Style,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
} from '../../../src/storehooks/style/types'

// A valid Style and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyle(overrides: Partial<Style> = {}): Style {
  return {
    id: 'dc4ee8ed-f0f8-4f0b-a9ba-46b1f3e8c1dd',
    name: 'Style',
    ...overrides,
  }
}

// A valid StyleWithParentIds and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyleWithParentIds(
  overrides: Partial<StyleWithParentIds> = {},
): StyleWithParentIds {
  return {
    id: '4e8a3d8f-1b25-4a1a-8f6e-06a1fbbf0a3c',
    name: 'Style',
    parents: [],
    ...overrides,
  }
}

// A valid StyleWithParentsAndChildren and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyleWithParentsAndChildren(
  overrides: Partial<StyleWithParentsAndChildren> = {},
): StyleWithParentsAndChildren {
  return {
    id: '8e2fc6bc-3d5f-4a8e-98ef-4a9ec0f7dc6a',
    name: 'Style',
    parents: [],
    children: [],
    ...overrides,
  }
}
