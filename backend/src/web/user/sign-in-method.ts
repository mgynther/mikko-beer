import type { IdBodyRequest } from '../request.js'

export interface SignInResponseUser {
  id: string
  role: 'admin' | 'viewer'
  username: string | null
}

export interface SignInBody {
  user: SignInResponseUser
  authToken: string
  refreshToken: string
}

export interface TokensBody {
  authToken: string
  refreshToken: string
}

export interface SignOutBody {
  success: boolean
}

export interface SignInRequest {
  body: unknown
}

export interface RefreshRequest {
  id: string | undefined
  body: unknown
}

export interface SignInMethodHandlers {
  signIn: (request: SignInRequest) => Promise<SignInBody>
  refresh: (request: RefreshRequest) => Promise<TokensBody>
  signOut: (request: RefreshRequest) => Promise<SignOutBody>
  changePassword: (request: IdBodyRequest) => Promise<void>
}
