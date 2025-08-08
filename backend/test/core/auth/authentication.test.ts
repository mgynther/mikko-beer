import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type {
  DbRefreshToken
} from '../../../src/core/auth/refresh-token'
import * as authTokenService from '../../../src/core/internal/auth/auth-token.service'
import * as authentication from '../../../src/core/auth/authentication'
import { Role } from '../../../src/core/user/user'
import type { User } from '../../../src/core/user/user'
import type { Tokens } from '../../../src/core/auth/tokens'
import type {
  AuthToken,
  AuthTokenConfig
} from '../../../src/core/auth/auth-token'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError
} from '../../../src/core/errors'
import { expectThrow } from '../controller-error-helper'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret
}
const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin: User = {
  id: 'f4768755-d692-458f-a311-5aaeb81fd4ec',
  role: Role.admin,
  username: 'admin'
}

const viewer: User = {
  id: 'c232d501-748e-4897-a2b7-4ee3387716e0',
  role: Role.viewer,
  username: 'viewer'
}

const expiredAuthToken: AuthToken = {
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjcxZWZlMi00MmVmLTQ3MjQtOGU2Ny0xYmIzZTdiYzIxZDMiLCJyb2xlIjoiYWRtaW4iLCJyZWZyZXNoVG9rZW5JZCI6IjkxNGY0MDM3LTZjZWUtNDZlZS04Nzk5LTE2NzNkYWQ2M2Y1NSIsImlhdCI6MTcxOTA3NjI2MiwiZXhwIjoxNzE5MDc2NTYyfQ.FX28XilV4myW0993MdBEnxeIYoDDljG6ZeOUJA5XMtY'
}

async function insertAuthToken(userId: string): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId
  }
}

async function createTokens(user: User): Promise<Tokens> {
  return await authTokenService.createTokens(
    insertAuthToken,
    user,
    authTokenConfig
  )
}

function header(authToken: AuthToken): string {
  return `Bearer ${authToken.authToken}`
}

describe('authentication service unit tests', () => {

  it('authenticate admin', async () => {
    const tokens = await createTokens(admin)
    const parsed = authentication.parseAuthTokenPayload(
      header(tokens.auth),
      authTokenSecret
    )
    assert.deepEqual(parsed, {
      userId: admin.id,
      role: Role.admin,
      refreshTokenId
    })
  })

  it('authenticate viewer', async () => {
    const tokens = await createTokens(viewer)
    const parsed = authentication.parseAuthTokenPayload(
      header(tokens.auth),
      authTokenSecret
    )
    assert.deepEqual(parsed, {
      userId: viewer.id,
      role: Role.viewer,
      refreshTokenId
    })
  })

  it('fail to parse auth token with expired auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        header(expiredAuthToken),
        authTokenSecret
      )
    }, expiredAuthTokenError)
  })

  it('fail to parse auth token without auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        undefined,
        authTokenSecret
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth header', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        'this is invalid auth header',
        authTokenSecret
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth token', () => {
    expectThrow(() => {
      authentication.parseAuthTokenPayload(
        'Bearer abc',
        authTokenSecret
      )
    }, invalidAuthTokenError)
  })
})
