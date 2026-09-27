import { suite, test } from '../../test.js'

import type {
  DbRefreshToken,
  RefreshToken,
  ValidateRefreshToken,
} from '../../../src/logic/auth/refresh-token.js'
import * as authTokenService from '../../../src/logic/internal/auth/auth-token.service.js'
import * as authentication from '../../../src/logic/auth/authentication.js'
import type { User } from '../../../src/logic/user/user.js'
import type { Tokens } from '../../../src/logic/auth/tokens'
import type {
  AuthToken,
  AuthTokenConfig,
} from '../../../src/logic/auth/auth-token.js'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
  invalidCredentialsTokenError,
  invalidRefreshTokenError,
} from '../../../src/logic/errors.js'
import { expectThrow } from '../controller-error-helper.js'
import { testJwtIf } from '../jwt-helper.js'
import { assertDeepEqual } from '../../assert.js'
import { buildUser } from '../user/builders.js'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret,
}
const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin = buildUser({ role: 'admin' })

const viewer = buildUser({ role: 'viewer' })

const expiredAuthToken: AuthToken = {
  authToken: testJwtIf.sign(
    {
      userId: admin.id,
      role: admin.role,
      refreshTokenId,
    },
    authTokenSecret,
    // A non-positive expiry duration makes the test jwt expire immediately.
    -1,
  ),
}

async function insertAuthToken(userId: string): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId,
  }
}

async function createTokens(user: User): Promise<Tokens> {
  return await authTokenService.createTokens(
    testJwtIf,
    insertAuthToken,
    user,
    authTokenConfig,
  )
}

function header(authToken: AuthToken): string {
  return `Bearer ${authToken.authToken}`
}

function passRefreshTokenValidation(token: RefreshToken): ValidateRefreshToken {
  return () => ({ errorCode: undefined, result: token })
}

const failRefreshTokenValidation: ValidateRefreshToken = () => ({
  errorCode: 'invalid-refresh-token',
  result: undefined,
})

suite('authentication service unit tests', () => {
  test('authenticate admin', async () => {
    const tokens = await createTokens(admin)
    const parsed = authentication.parseAuthTokenPayload(
      testJwtIf,
      header(tokens.auth),
      authTokenSecret,
    )
    assertDeepEqual(parsed, {
      userId: admin.id,
      role: 'admin',
      refreshTokenId,
    })
  })

  test('authenticate viewer', async () => {
    const tokens = await createTokens(viewer)
    const parsed = authentication.parseAuthTokenPayload(
      testJwtIf,
      header(tokens.auth),
      authTokenSecret,
    )
    assertDeepEqual(parsed, {
      userId: viewer.id,
      role: 'viewer',
      refreshTokenId,
    })
  })

  test('fail to parse auth token with expired auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        header(expiredAuthToken),
        authTokenSecret,
      )
    }, expiredAuthTokenError)
  })

  test('fail to parse auth token without auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        undefined,
        authTokenSecret,
      )
    }, invalidAuthorizationHeaderError)
  })

  test('fail to parse auth token with invalid auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        'this is invalid auth header',
        authTokenSecret,
      )
    }, invalidAuthorizationHeaderError)
  })

  test('fail to parse auth token with invalid auth token', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        'Bearer abc',
        authTokenSecret,
      )
    }, invalidAuthTokenError)
  })

  test('parse refresh token', async () => {
    const tokens = await createTokens(viewer)
    const parsed = authentication.parseRefreshTokenPayload(
      testJwtIf,
      passRefreshTokenValidation(tokens.refresh),
      tokens.refresh,
      authTokenSecret,
    )
    assertDeepEqual(parsed, {
      userId: viewer.id,
      refreshTokenId,
      isRefreshToken: true,
    })
  })

  test('fail to parse refresh token from invalid request', () => {
    expectThrow(() => {
      authentication.parseRefreshTokenPayload(
        testJwtIf,
        failRefreshTokenValidation,
        {},
        authTokenSecret,
      )
    }, invalidRefreshTokenError)
  })

  test('fail to parse invalid refresh token', () => {
    const invalidRefreshToken: RefreshToken = {
      refreshToken: 'this is invalid',
    }
    expectThrow(() => {
      authentication.parseRefreshTokenPayload(
        testJwtIf,
        passRefreshTokenValidation(invalidRefreshToken),
        invalidRefreshToken,
        authTokenSecret,
      )
    }, invalidCredentialsTokenError)
  })
})
