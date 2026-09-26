import type {
  AuthTokenConfig,
  AuthTokenPayload,
} from '../../../src/logic/auth/auth-token.js'
import type { DbRefreshToken } from '../../../src/logic/auth/refresh-token.js'

// A valid AuthTokenPayload and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildAuthTokenPayload(
  overrides: Partial<AuthTokenPayload> = {},
): AuthTokenPayload {
  return {
    userId: 'b3311882-d3e7-494c-b788-ead3bb425b09',
    role: 'viewer',
    refreshTokenId: 'de3e7866-40d6-4777-997f-e7bde95840ad',
    ...overrides,
  }
}

// A valid AuthTokenConfig and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildAuthTokenConfig(
  overrides: Partial<AuthTokenConfig> = {},
): AuthTokenConfig {
  return {
    secret: 'secret',
    expiryDurationMin: 5,
    ...overrides,
  }
}

// A valid DbRefreshToken and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildDbRefreshToken(
  overrides: Partial<DbRefreshToken> = {},
): DbRefreshToken {
  return {
    id: '9988365d-e425-4746-927f-152cab1065c0',
    userId: 'abe24243-468d-41ef-bf2c-06ae508a8b8e',
    ...overrides,
  }
}
