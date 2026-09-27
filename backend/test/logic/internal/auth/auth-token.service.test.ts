import { suite, test } from '../../../test.js'

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
import type { Tokens } from '../../../../src/logic/auth/tokens'
import { invalidCredentialsTokenError } from '../../../../src/logic/errors.js'
import { expectReject, expectThrow } from '../../controller-error-helper.js'
import {
  assertDeepEqual,
  assertEqual,
  assertNotEqual,
  assertThrows,
  assertTruthy,
} from '../../../assert.js'
import { testJwtIf } from '../../jwt-helper.js'
import { buildUser } from '../../user/builders.js'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret,
}

const refreshTokenId = '914f4037-6cee-46ee-8799-1673dad63f55'

const user = buildUser({ role: 'admin' })

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

suite('auth token service unit tests', () => {
  function token(content: string): AuthToken {
    return {
      authToken: content,
    }
  }

  test('fail to verify invalid auth token', () => {
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
  test('create, verify and delete tokens', async () => {
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
      return true
    }

    const refreshTokenPayload = authTokenService.parseRefreshToken(
      testJwtIf,
      tokens.refresh,
      authTokenSecret,
    )
    authTokenService.verifyRefreshTokenOwner(user.id, refreshTokenPayload)
    await authTokenService.deleteRefreshToken(deleteToken, refreshTokenPayload)
    assertEqual(wasDeleted, true)
  })

  test('fail to verify auth token with wrong secret', async () => {
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

  test('fail to verify expired auth token', () => {
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

  test('fail to delete refresh token that was already deleted', async () => {
    const tokens = await authTokenService.createTokens(
      testJwtIf,
      insertAuthToken,
      user,
      authTokenConfig,
    )

    const refreshTokenPayload = authTokenService.parseRefreshToken(
      testJwtIf,
      tokens.refresh,
      authTokenSecret,
    )

    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        async () => false,
        refreshTokenPayload,
      )
    }, invalidCredentialsTokenError)
  })

  test('fail to verify refresh token owner on user mismatch', () => {
    const wrongUserId = 'f388b0cb-63f5-4f6e-a9e6-3b6ac92844a7'
    expectThrow(() => {
      authTokenService.verifyRefreshTokenOwner(wrongUserId, {
        userId: user.id,
        refreshTokenId,
        isRefreshToken: true,
      })
    }, invalidCredentialsTokenError)
  })

  test('fail to parse refresh token with wrong secret', async () => {
    const tokens = await authTokenService.createTokens(
      testJwtIf,
      insertAuthToken,
      user,
      authTokenConfig,
    )

    expectThrow(() => {
      authTokenService.parseRefreshToken(
        testJwtIf,
        tokens.refresh,
        'ThisIsWrongSecret',
      )
    }, invalidCredentialsTokenError)
  })
})
