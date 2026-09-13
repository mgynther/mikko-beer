import { describe, it } from 'node:test'

import * as jwt from '../../../../src/logic/internal/auth/jwt.js'
import type {
  AuthTokenConfig,
  AuthTokenPayload,
  JwtClaims,
  JwtIf,
} from '../../../../src/logic/auth/auth-token.js'
import {
  AuthTokenExpiredError,
  InvalidAuthTokenError,
} from '../../../../src/logic/auth/auth-token.js'
import { assertDeepEqual, assertThrows } from '../../../assert.js'

const secret = 'thisissecret'

const authTokenConfig: AuthTokenConfig = {
  secret,
  expiryDurationMin: 5,
}

const authTokenPayload: AuthTokenPayload = {
  userId: '6b58d7a1-25b6-4f22-b2e4-3a40aa8d4a44',
  role: 'admin',
  refreshTokenId: '1fbb1e58-1b63-4b0a-9d35-3f5a42f0cf52',
}

const refreshTokenPayload: jwt.RefreshTokenPayload = {
  userId: authTokenPayload.userId,
  refreshTokenId: authTokenPayload.refreshTokenId,
  isRefreshToken: true,
}

function notCalled(): never {
  throw new Error('not to be called')
}

function verifyingJwtIf(claims: JwtClaims): JwtIf {
  return {
    sign: notCalled,
    verify: () => ({ errorCode: undefined, result: claims }),
  }
}

function failingJwtIf(errorCode: 'expired-jwt' | 'invalid-jwt'): JwtIf {
  return {
    sign: notCalled,
    verify: () => ({ errorCode, result: undefined }),
  }
}

describe('jwt unit tests', () => {
  it('sign auth token', () => {
    const signedClaims: JwtClaims[] = []
    const secrets: string[] = []
    const expiries: Array<number | undefined> = []
    const jwtIf: JwtIf = {
      sign: (claims, signSecret, expiryDurationMin) => {
        signedClaims.push(claims)
        secrets.push(signSecret)
        expiries.push(expiryDurationMin)
        return 'signed auth token'
      },
      verify: notCalled,
    }
    const result = jwt.signAuthToken(jwtIf, authTokenPayload, authTokenConfig)
    assertDeepEqual(result, { authToken: 'signed auth token' })
    assertDeepEqual(signedClaims, [{ ...authTokenPayload }])
    assertDeepEqual(secrets, [secret])
    assertDeepEqual(expiries, [authTokenConfig.expiryDurationMin])
  })

  it('sign refresh token without expiry', () => {
    const expiries: Array<number | undefined> = []
    const jwtIf: JwtIf = {
      sign: (_claims, _signSecret, expiryDurationMin) => {
        expiries.push(expiryDurationMin)
        return 'signed refresh token'
      },
      verify: notCalled,
    }
    const result = jwt.signRefreshToken(jwtIf, refreshTokenPayload, secret)
    assertDeepEqual(result, { refreshToken: 'signed refresh token' })
    assertDeepEqual(expiries, [undefined])
  })

  it('verify auth token', () => {
    const jwtIf = verifyingJwtIf({ ...authTokenPayload })
    const result = jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret)
    assertDeepEqual(result, authTokenPayload)
  })

  it('verify refresh token', () => {
    const jwtIf = verifyingJwtIf({ ...refreshTokenPayload })
    const result = jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret)
    assertDeepEqual(result, refreshTokenPayload)
  })

  it('pass the token and secret to verification', () => {
    const tokens: string[] = []
    const secrets: string[] = []
    const jwtIf: JwtIf = {
      sign: notCalled,
      verify: (token, verifySecret) => {
        tokens.push(token)
        secrets.push(verifySecret)
        return { errorCode: undefined, result: { ...authTokenPayload } }
      },
    }
    jwt.verifyAuthToken(jwtIf, { authToken: 'the token' }, secret)
    assertDeepEqual(tokens, ['the token'])
    assertDeepEqual(secrets, [secret])
  })

  it('fail to verify an expired auth token', () => {
    const jwtIf = failingJwtIf('expired-jwt')
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new AuthTokenExpiredError(),
      AuthTokenExpiredError,
    )
  })

  it('fail to verify an invalid auth token', () => {
    const jwtIf = failingJwtIf('invalid-jwt')
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  it('fail to verify an expired refresh token', () => {
    const jwtIf = failingJwtIf('expired-jwt')
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new AuthTokenExpiredError(),
      AuthTokenExpiredError,
    )
  })

  it('fail to verify an invalid refresh token', () => {
    const jwtIf = failingJwtIf('invalid-jwt')
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  it('fail to verify an auth token with an invalid payload', () => {
    const jwtIf = verifyingJwtIf({ userId: 123 })
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  it('fail to verify a refresh token with an invalid payload', () => {
    const jwtIf = verifyingJwtIf({ ...authTokenPayload })
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })
})
