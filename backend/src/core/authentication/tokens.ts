import { type AuthToken } from './auth-token'
import { type RefreshToken } from './refresh-token'

export interface Tokens {
  auth: AuthToken
  refresh: RefreshToken
}
