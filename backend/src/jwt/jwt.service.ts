import { signClaims, verifyClaims } from './internal/jsonwebtoken.js'

import type { JwtClaims, VerifyJwtResult } from './jwt.js'

export function signJwt(
  claims: JwtClaims,
  secret: string,
  expiryDurationMin: number | undefined,
): string {
  return signClaims(claims, secret, expiryDurationMin)
}

export function verifyJwt(token: string, secret: string): VerifyJwtResult {
  return verifyClaims(token, secret)
}
