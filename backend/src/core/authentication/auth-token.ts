export interface AuthToken {
  authToken: string
}

export interface AuthTokenConfig {
  secret: string
  expiryDuration: string
}
