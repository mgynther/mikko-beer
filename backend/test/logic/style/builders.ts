import type {
  CreateStyleRequest,
  Style,
  StyleWithParentIds,
  StyleWithParentsAndChildren,
  UpdateStyleRequest,
} from '../../../src/logic/style/style.js'

// A valid Style and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStyle(overrides: Partial<Style> = {}): Style {
  return {
    id: '76d8aed8-5d96-40b1-8246-aa60803bc9a3',
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
    id: 'cba2fd6d-9573-426e-8bfc-64a0429bab98',
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
    id: 'c4e3ee94-6e20-41f4-856d-9bea70f24b73',
    name: 'Style',
    children: [],
    parents: [],
    ...overrides,
  }
}

// A valid CreateStyleRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateStyleRequest(
  overrides: Partial<CreateStyleRequest> = {},
): CreateStyleRequest {
  return {
    name: 'Style',
    parents: [],
    ...overrides,
  }
}

// A valid UpdateStyleRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateStyleRequest(
  overrides: Partial<UpdateStyleRequest> = {},
): UpdateStyleRequest {
  return {
    name: 'Style',
    parents: [],
    ...overrides,
  }
}
