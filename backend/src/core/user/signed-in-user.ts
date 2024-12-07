import type { AuthToken } from '../auth/auth-token'
import type { RefreshToken } from '../auth/refresh-token'
import type { User } from '../../core/user/user'

export interface SignedInUser {
  refreshToken: RefreshToken
  authToken: AuthToken
  user: User
}
