import type { AuthToken } from './auth-token.js'
import type { RefreshToken } from './refresh-token.js'

export interface Tokens {
  auth: AuthToken
  refresh: RefreshToken
}
