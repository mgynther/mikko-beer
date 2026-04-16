import { describe, it } from 'node:test'
import jsonwebtoken from 'jsonwebtoken'
const { sign } = jsonwebtoken
import * as jwt from '../../../../src/core/internal/auth/jwt.js'
import type { AuthToken } from '../../../../src/core/auth/auth-token.js'
import { InvalidAuthTokenError } from '../../../../src/core/auth/auth-token.js'
import { assertThrows } from '../../../assert.js'
import type { RefreshToken } from '../../../../src/core/auth/refresh-token.js'

const secret = 'thisissecret'

const token = sign('hacking', secret)

describe('jwt unit tests', () => {
  it('fail verify invalid string auth token', async () => {
    const authToken: AuthToken = {
      authToken: token,
    }
    assertThrows(
      () => jwt.verifyAuthToken(authToken, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })

  it('fail verify invalid string refresh token', async () => {
    const refreshToken: RefreshToken = {
      refreshToken: token,
    }
    assertThrows(
      () => jwt.verifyRefreshToken(refreshToken, secret),
      new InvalidAuthTokenError(),
      InvalidAuthTokenError,
    )
  })
})
