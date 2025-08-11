import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import * as authTokenService from '../../../../src/core/internal/auth/auth-token.service'
import type {
  AuthToken,
  AuthTokenConfig,
} from '../../../../src/core/auth/auth-token'
import {
  AuthTokenExpiredError,
  InvalidAuthTokenError
} from '../../../../src/core/auth/auth-token'
import type { DbRefreshToken } from '../../../../src/core/auth/refresh-token'
import type { User } from '../../../../src/core/user/user'
import type { Tokens } from '../../../../src/core/auth/tokens'
import { invalidCredentialsTokenError } from '../../../../src/core/errors'
import { expectReject } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret
}

const refreshTokenId = '914f4037-6cee-46ee-8799-1673dad63f55'

const knownTokens: Tokens = {
  auth: {
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjcxZWZlMi00MmVmLTQ3MjQtOGU2Ny0xYmIzZTdiYzIxZDMiLCJyb2xlIjoiYWRtaW4iLCJyZWZyZXNoVG9rZW5JZCI6IjkxNGY0MDM3LTZjZWUtNDZlZS04Nzk5LTE2NzNkYWQ2M2Y1NSIsImlhdCI6MTcxOTA3NjI2MiwiZXhwIjoxNzE5MDc2NTYyfQ.FX28XilV4myW0993MdBEnxeIYoDDljG6ZeOUJA5XMtY'
  },
  refresh: {
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjcxZWZlMi00MmVmLTQ3MjQtOGU2Ny0xYmIzZTdiYzIxZDMiLCJyZWZyZXNoVG9rZW5JZCI6IjkxNGY0MDM3LTZjZWUtNDZlZS04Nzk5LTE2NzNkYWQ2M2Y1NSIsImlzUmVmcmVzaFRva2VuIjp0cnVlLCJpYXQiOjE3MTkwNzYyNjJ9.d7A_QlMk14IvkDeApAvNwG61eNjaq6iCP-0Bmy0Yeo8'
  }
}

const user: User = {
  id: '4b71efe2-42ef-4724-8e67-1bb3e7bc21d3',
  role: 'admin',
  username: 'admin'
}

function expectKnownTokens(tokens: Tokens) {
  function getStart(token: string) {
    return token.split('.')[0]
  }
  assert.equal(getStart(tokens.auth.authToken),
    getStart(knownTokens.auth.authToken)
  )
  assert.equal(getStart(tokens.refresh.refreshToken),
    getStart(knownTokens.refresh.refreshToken)
  )
}

async function insertAuthToken(userId: string): Promise<DbRefreshToken> {
  assert.equal(userId, user.id)
  return {
    id: refreshTokenId,
    userId
  }
}

describe('auth token service unit tests', () => {

  function token(content: string): AuthToken {
    return {
      authToken: content
    }
  }

  it('fail to verify invalid auth token', () => {
    assert.throws(() => {
      authTokenService.verifyAuthToken(token('invalid'), authTokenSecret)
    }, new InvalidAuthTokenError())
  })

  // Tokens are time sensitive so they are difficult to test in isolated steps.
  it('create, verify and delete tokens', async () => {
    const tokens = await authTokenService.createTokens(
      insertAuthToken,
      user,
      authTokenConfig
    )
    expectKnownTokens(tokens)

    const authTokenPayload = authTokenService.verifyAuthToken(
      tokens.auth,
      authTokenSecret
    )
    assertDeepEqual(authTokenPayload, {
      userId: user.id,
      role: 'admin',
      refreshTokenId
    })

    let wasDeleted = false
    async function deleteToken(deletedRefreshTokenId: string) {
      assert.equal(deletedRefreshTokenId, refreshTokenId)
      assert.equal(wasDeleted, false)
      wasDeleted = true
    }

    await authTokenService.deleteRefreshToken(
      deleteToken,
      user.id,
      tokens.refresh,
      authTokenSecret
    )
    assert.equal(wasDeleted, true)
  })

  it('fail to verify auth token with wrong secret', async () => {
    const tokens = await authTokenService.createTokens(
      insertAuthToken,
      user,
      authTokenConfig
    )
    expectKnownTokens(tokens)

    assert.throws(() => {
      authTokenService.verifyAuthToken(tokens.auth, 'ThisIsWrongSecret')
    }, new InvalidAuthTokenError())
  })

  it('fail to verify expired auth token', async () => {
    assert.throws(() => {
      authTokenService.verifyAuthToken(knownTokens.auth, authTokenSecret)
    }, new AuthTokenExpiredError())
  })

  it('fail to delete refresh token on user mismatch', async () => {
    const tokens = await authTokenService.createTokens(
      insertAuthToken,
      user,
      authTokenConfig
    )
    expectKnownTokens(tokens)

    const wrongUserId = 'f388b0cb-63f5-4f6e-a9e6-3b6ac92844a7'
    expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        () => { throw new Error('must not be called') },
        wrongUserId,
        tokens.refresh,
        authTokenSecret
      )
    }, invalidCredentialsTokenError)
  })
})
