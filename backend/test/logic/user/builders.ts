import type { User } from '../../../src/logic/user/user.js'

// A valid User and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: '9b925071-81bb-4b2b-8082-a37ca9970f01',
    role: 'viewer',
    username: 'user',
    ...overrides,
  }
}
