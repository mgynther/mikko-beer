import type { AuthToken } from '../../auth/auth-token.js'
import type { RefreshToken } from '../../auth/refresh-token.js'
import type { User } from '../../user/user.js'

export interface SignedInUser {
  refreshToken: RefreshToken
  authToken: AuthToken
  user: User
}
