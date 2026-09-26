import type { Login } from '../../../../src/components/types/login/types'
import { buildUser } from '../user/builders'

// A valid Login and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildLogin(overrides: Partial<Login> = {}): Login {
  return {
    authToken: 'authtoken',
    refreshToken: 'refreshtoken',
    user: buildUser(),
    ...overrides,
  }
}
