import { describe, it } from 'node:test'

import * as authTokenService from '../../../../src/logic/internal/auth/auth-token.service.js'
import type {
  AuthToken,
  AuthTokenConfig,
} from '../../../../src/logic/auth/auth-token.js'
import {
  AuthTokenExpiredError,
  InvalidAuthTokenError,
} from '../../../../src/logic/auth/auth-token.js'
import type { DbRefreshToken } from '../../../../src/logic/auth/refresh-token.js'
import type { User } from '../../../../src/logic/user/user.js'
import type { Tokens } from '../../../../src/logic/auth/tokens'
import { invalidCredentialsTokenError } from '../../../../src/logic/errors.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  assertDeepEqual,
  assertEqual,
  assertNotEqual,
  assertThrows,
  assertTruthy,
} from '../../../assert.js'
import { testJwtIf } from '../../jwt-helper.js'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret,
}

const refreshTokenId = '914f4037-6cee-46ee-8799-1673dad63f55'

const user: User = {
  id: '4b71efe2-42ef-4724-8e67-1bb3e7bc21d3',
  role: 'admin',
  username: 'admin',
}

// The token format itself belongs to the jwt layer. Here it is enough that
// two distinct tokens were created.
function expectCreatedTokens(tokens: Tokens) {
  assertTruthy(tokens.auth.authToken)
  assertTruthy(tokens.refresh.refreshToken)
  assertNotEqual(tokens.auth.authToken, tokens.refresh.refreshToken)
}

async function insertAuthToken(userId: string): Promise<DbRefreshToken> {
  assertEqual(userId, user.id)
  return {
    id: refreshTokenId,
    userId,
  }
}

describe('auth token service unit tests', () => {
  function token(content: string): AuthToken {
    return {
      authToken: content,
    }
  }

  it('fail to verify invalid auth token', () => {
    assertThrows(
      () => {
        authTokenService.verifyAuthToken(
          testJwtIf,
          token('invalid'),
          authTokenSecret,
        )
      },
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  // Tokens are time sensitive so they are difficult to test in isolated steps.
  it('create, verify and delete tokens', async () => {
    const tokens = await authTokenService.createTokens(
      testJwtIf,
      insertAuthToken,
      user,
      authTokenConfig,
    )
    expectCreatedTokens(tokens)

    const authTokenPayload = authTokenService.verifyAuthToken(
      testJwtIf,
      tokens.auth,
      authTokenSecret,
    )
    assertDeepEqual(authTokenPayload, {
      userId: user.id,
      role: 'admin',
      refreshTokenId,
    })

    let wasDeleted = false
    async function deleteToken(deletedRefreshTokenId: string) {
      assertEqual(deletedRefreshTokenId, refreshTokenId)
      assertEqual(wasDeleted, false)
      wasDeleted = true
    }

    await authTokenService.deleteRefreshToken(
      testJwtIf,
      deleteToken,
      user.id,
      tokens.refresh,
      authTokenSecret,
    )
    assertEqual(wasDeleted, true)
  })

  it('fail to verify auth token with wrong secret', async () => {
    const tokens = await authTokenService.createTokens(
      testJwtIf,
      insertAuthToken,
      user,
      authTokenConfig,
    )
    expectCreatedTokens(tokens)

    assertThrows(
      () => {
        authTokenService.verifyAuthToken(
          testJwtIf,
          tokens.auth,
          'ThisIsWrongSecret',
        )
      },
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  it('fail to verify expired auth token', () => {
    const expiredAuthToken: AuthToken = {
      // A non-positive expiry duration makes the test jwt expire immediately.
      authToken: testJwtIf.sign(
        { userId: user.id, role: user.role, refreshTokenId },
        authTokenSecret,
        -1,
      ),
    }
    assertThrows(
      () => {
        authTokenService.verifyAuthToken(
          testJwtIf,
          expiredAuthToken,
          authTokenSecret,
        )
      },
      new AuthTokenExpiredError(),
      AuthTokenExpiredError,
    )
  })

  it('fail to delete refresh token on user mismatch', async () => {
    const tokens = await authTokenService.createTokens(
      testJwtIf,
      insertAuthToken,
      user,
      authTokenConfig,
    )
    expectCreatedTokens(tokens)

    const wrongUserId = 'f388b0cb-63f5-4f6e-a9e6-3b6ac92844a7'
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        testJwtIf,
        () => {
          throw new Error('must not be called')
        },
        wrongUserId,
        tokens.refresh,
        authTokenSecret,
      )
    }, invalidCredentialsTokenError)
  })
})
