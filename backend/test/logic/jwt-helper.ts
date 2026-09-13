import type { JwtClaims, JwtIf } from '../../src/logic/auth/auth-token.js'

// A jwt implementation for tests. The logic layer only knows JwtIf, so its
// tests need no jwt library: tokens are opaque handles into this map.
interface SignedToken {
  claims: JwtClaims
  secret: string
  expired: boolean
}

const signedTokens = new Map<string, SignedToken>()
let signedTokenCount = 0

export const testJwtIf: JwtIf = {
  sign: (claims: JwtClaims, secret: string, expiryDurationMin) => {
    signedTokenCount += 1
    const token = `test-token-${signedTokenCount}`
    signedTokens.set(token, {
      claims,
      secret,
      expired: expiryDurationMin !== undefined && expiryDurationMin <= 0,
    })
    return token
  },
  verify: (token: string, secret: string) => {
    const signed = signedTokens.get(token)
    if (signed === undefined || signed.secret !== secret) {
      return { errorCode: 'invalid-jwt', result: undefined }
    }
    if (signed.expired) {
      return { errorCode: 'expired-jwt', result: undefined }
    }
    return { errorCode: undefined, result: signed.claims }
  },
}
