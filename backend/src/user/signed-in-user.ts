import { type AuthToken } from '../authentication/auth-token'
import { type RefreshToken } from '../authentication/refresh-token'
import { type User } from './user'

export interface SignedInUser {
  refreshToken: RefreshToken
  authToken: AuthToken
  user: User
}
