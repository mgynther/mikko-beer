import { suite, test } from '../../../test.js'

import * as jwt from '../../../../src/logic/internal/auth/jwt.js'
import type {
  AuthTokenConfig,
  JwtClaims,
  JwtIf,
} from '../../../../src/logic/auth/auth-token.js'
import {
  AuthTokenExpiredError,
  InvalidAuthTokenError,
} from '../../../../src/logic/auth/auth-token.js'
import type { RefreshTokenPayload } from '../../../../src/logic/auth/refresh-token.js'
import { assertDeepEqual, assertThrows } from '../../../assert.js'
import { buildAuthTokenPayload } from '../../auth/builders.js'

const secret = 'thisissecret'

const authTokenConfig: AuthTokenConfig = {
  secret,
  expiryDurationMin: 5,
}

const authTokenPayload = buildAuthTokenPayload()

const refreshTokenPayload: RefreshTokenPayload = {
  userId: '6b58d7a1-25b6-4f22-b2e4-3a40aa8d4a44',
  refreshTokenId: '1fbb1e58-1b63-4b0a-9d35-3f5a42f0cf52',
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

suite('jwt unit tests', () => {
  test('sign auth token', () => {
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

  test('sign refresh token without expiry', () => {
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

  test('verify auth token', () => {
    const jwtIf = verifyingJwtIf({ ...authTokenPayload })
    const result = jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret)
    assertDeepEqual(result, authTokenPayload)
  })

  test('verify refresh token', () => {
    const jwtIf = verifyingJwtIf({ ...refreshTokenPayload })
    const result = jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret)
    assertDeepEqual(result, refreshTokenPayload)
  })

  test('pass the token and secret to verification', () => {
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

  test('fail to verify an expired auth token', () => {
    const jwtIf = failingJwtIf('expired-jwt')
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new AuthTokenExpiredError(),
      AuthTokenExpiredError,
    )
  })

  test('fail to verify an invalid auth token', () => {
    const jwtIf = failingJwtIf('invalid-jwt')
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  test('fail to verify an expired refresh token', () => {
    const jwtIf = failingJwtIf('expired-jwt')
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new AuthTokenExpiredError(),
      AuthTokenExpiredError,
    )
  })

  test('fail to verify an invalid refresh token', () => {
    const jwtIf = failingJwtIf('invalid-jwt')
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  test('fail to verify an auth token with an invalid payload', () => {
    const jwtIf = verifyingJwtIf({ userId: 123 })
    assertThrows(
      () => jwt.verifyAuthToken(jwtIf, { authToken: 'a' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  test('fail to verify a refresh token with an invalid payload', () => {
    const jwtIf = verifyingJwtIf({ ...authTokenPayload })
    assertThrows(
      () => jwt.verifyRefreshToken(jwtIf, { refreshToken: 'r' }, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })
})
