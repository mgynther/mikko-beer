import { Role } from '../../../../src/components/types/user/types'
import type { User } from '../../../../src/components/types/user/types'

// A valid User and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'c7d8e9f0-a1b2-43c4-95d6-e7f8a9b0c1d2',
    username: 'user',
    role: Role.viewer,
    ...overrides,
  }
}
