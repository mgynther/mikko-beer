import * as jwt from '../../../src/core/internal/auth/jwt'

import * as service
from '../../../src/core/user/authorized-sign-in-method.service'

import type { RefreshToken } from '../../../src/core/auth/refresh-token'

import type {
  RefreshTokensIf
} from '../../../src/core/user/authorized-sign-in-method.service'
import type {
  AuthTokenConfig,
} from '../../../src/core/auth/auth-token'
import { Role } from '../../../src/core/user/user'
import { invalidCredentialsTokenError } from '../../../src/core/errors'
import { expectReject } from '../controller-error-helper'

const userId = '589e0cf9-7a2d-4c7e-8d62-6e67f32cb3ce'
const refreshTokenId = 'c6697088-c417-4dee-988d-c018b07527f7'

const authTokenSecret: string = 'this is secret'

const validRefreshToken: RefreshToken = jwt.signRefreshToken({
  userId,
  refreshTokenId,
  isRefreshToken: true
}, authTokenSecret)

const refreshTokensIf: RefreshTokensIf = {
  deleteRefreshToken: async () => undefined,
  insertRefreshToken: async () => ({
    id: 'e6190cc2-630e-4f23-bc70-aa76254ef28b',
    userId
  }),
  lockUserById: async () => ({
    id: userId,
    role: Role.admin,
    username: 'admin'
  })
}

const authTokenConfig: AuthTokenConfig = {
  secret: authTokenSecret,
  expiryDuration: '1min'
}

describe('authorized sign in method service unit tests', () => {
  it('refresh tokens with valid refresh token', async () => {
    await service.refreshTokens(
      refreshTokensIf,
      userId,
      validRefreshToken,
      authTokenConfig
    )
  })

  it('fail to refresh tokens with invalid refresh token', async () => {
    await expectReject(async () => {
      await service.refreshTokens(
        refreshTokensIf,
        userId,
        { refreshToken: 'this is invalid' },
        authTokenConfig
      )
    }, invalidCredentialsTokenError)
  })
})
