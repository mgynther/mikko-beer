import { describe, it } from 'node:test'
import * as jsonwebtoken from 'jsonwebtoken'
import * as jwt from '../../../../src/core/internal/auth/jwt'
import type { AuthToken } from '../../../../src/core/auth/auth-token'
import { InvalidAuthTokenError } from '../../../../src/core/auth/auth-token'
import { assertThrows } from '../../../assert'
import type { RefreshToken } from '../../../../src/core/auth/refresh-token'

const secret = 'thisissecret'

const token = jsonwebtoken.sign(
  'hacking',
  secret
)

describe('jwt unit tests', () => {
  it('fail verify invalid string auth token', async () => {
    const authToken: AuthToken = {
      authToken: token
    }
    assertThrows(
      () => jwt.verifyAuthToken(
        authToken,
        secret,
      ),
      new InvalidAuthTokenError(), InvalidAuthTokenError
    )
  })

  it('fail verify invalid string refresh token', async () => {
    const refreshToken: RefreshToken = {
      refreshToken: token
    }
    assertThrows(
      () => jwt.verifyRefreshToken(
        refreshToken,
        secret,
      ),
      new InvalidAuthTokenError(), InvalidAuthTokenError
    )
  })
})
