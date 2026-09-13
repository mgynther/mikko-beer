import { describe, it } from 'node:test'

import type { DbRefreshToken } from '../../../src/logic/auth/refresh-token.js'
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
} from '../../../src/logic/errors.js'
import { expectThrow } from '../controller-error-helper.js'
import { testJwtIf } from '../jwt-helper.js'
import { assertDeepEqual } from '../../assert.js'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret,
}
const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin: User = {
  id: 'f4768755-d692-458f-a311-5aaeb81fd4ec',
  role: 'admin',
  username: 'admin',
}

const viewer: User = {
  id: 'c232d501-748e-4897-a2b7-4ee3387716e0',
  role: 'viewer',
  username: 'viewer',
}

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

describe('authentication service unit tests', () => {
  it('authenticate admin', async () => {
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

  it('authenticate viewer', async () => {
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

  it('fail to parse auth token with expired auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        header(expiredAuthToken),
        authTokenSecret,
      )
    }, expiredAuthTokenError)
  })

  it('fail to parse auth token without auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        undefined,
        authTokenSecret,
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        'this is invalid auth header',
        authTokenSecret,
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth token', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        testJwtIf,
        'Bearer abc',
        authTokenSecret,
      )
    }, invalidAuthTokenError)
  })
})
