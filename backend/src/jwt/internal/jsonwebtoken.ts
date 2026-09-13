// This file is the only place that uses the jsonwebtoken library. Everything
// else in the layer works on the types declared here.
import jsonwebtoken from 'jsonwebtoken'
const { sign, verify, TokenExpiredError } = jsonwebtoken

export type JwtClaims = Record<string, unknown>

export type VerifyResult =
  | {
      errorCode: 'expired-jwt' | 'invalid-jwt'
      result: undefined
    }
  | {
      errorCode: undefined
      result: JwtClaims
    }

export function signClaims(
  claims: JwtClaims,
  secret: string,
  expiryDurationMin: number | undefined,
): string {
  if (expiryDurationMin === undefined) {
    // Tokens without an expiry duration never expire.
    return sign(claims, secret)
  }
  return sign(claims, secret, {
    expiresIn: `${expiryDurationMin}m`,
  })
}

export function verifyClaims(token: string, secret: string): VerifyResult {
  try {
    const payload = verify(token, secret)
    if (typeof payload === 'string') {
      return { errorCode: 'invalid-jwt', result: undefined }
    }
    return { errorCode: undefined, result: payload }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { errorCode: 'expired-jwt', result: undefined }
    }
    return { errorCode: 'invalid-jwt', result: undefined }
  }
}
