import * as jwt from '../../../src/core/internal/auth/jwt'

import * as service
from '../../../src/core/user/authorized-sign-in-method.service'

import type {
  DbRefreshToken,
  RefreshToken
} from '../../../src/core/auth/refresh-token'

import type {
  RefreshTokensIf
} from '../../../src/core/user/authorized-sign-in-method.service'
import type {
  AuthTokenConfig,
  AuthTokenPayload,
} from '../../../src/core/auth/auth-token'
import { Role } from '../../../src/core/user/user'
import type { User } from '../../../src/core/user/user'
import {
  invalidCredentialsTokenError,
  userMismatchError
} from '../../../src/core/errors'
import { expectReject } from '../controller-error-helper'
import type {
  ChangePasswordUserIf,
  PasswordChange,
  SignInUsingPasswordIf,
  UserPasswordHash
} from '../../../src/core/user/sign-in-method'

const userId = '589e0cf9-7a2d-4c7e-8d62-6e67f32cb3ce'
const refreshTokenId = 'c6697088-c417-4dee-988d-c018b07527f7'

const user: User = {
  id: userId,
  role: Role.admin,
  username: 'admin'
}

const adminAuthToken: AuthTokenPayload = {
  userId,
  role: Role.admin,
  refreshTokenId
}

const viewerAuthToken: AuthTokenPayload = {
  userId: 'dbf43779-cc8b-4097-bca2-af0b8e6da64b',
  role: Role.viewer,
  refreshTokenId: '0054d008-2a4c-4c84-af92-886df7dd38fe'
}

const authTokenSecret: string = 'this is secret'

const knownPassword = 'password'
const knownHash = '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

const validRefreshToken: RefreshToken = jwt.signRefreshToken({
  userId,
  refreshTokenId,
  isRefreshToken: true
}, authTokenSecret)

const dbRefreshToken: DbRefreshToken = {
  id: 'e6190cc2-630e-4f23-bc70-aa76254ef28b',
  userId
}

const refreshTokensIf: RefreshTokensIf = {
  deleteRefreshToken: async () => undefined,
  insertRefreshToken: async () => dbRefreshToken,
  lockUserById: async () => user
}

const authTokenConfig: AuthTokenConfig = {
  secret: authTokenSecret,
  expiryDuration: '1min'
}

const userPasswordHash: UserPasswordHash = {
  userId,
  passwordHash: knownHash
}

const signInUsingPasswordIf: SignInUsingPasswordIf = {
  lockUserByUsername: async () => user,
  findPasswordSignInMethod: async () => userPasswordHash,
  insertRefreshToken: async () => dbRefreshToken
}

const changePasswordUserIf: ChangePasswordUserIf = {
  lockUserById: async () => user,
  findPasswordSignInMethod: async () => userPasswordHash,
  updatePassword: async () => undefined
}

const passwordChange: PasswordChange = {
  oldPassword: knownPassword,
  newPassword: 'this is new password'
}

describe('authorized sign in method service unit tests', () => {
  it('sign in using password', async () => {
    await service.signInUsingPassword(
      signInUsingPasswordIf,
      {
        username: 'admin',
        password: knownPassword
      },
      authTokenConfig
    )
  })

  it('change password', async () => {
    await service.changePassword(
      changePasswordUserIf,
      async () => dbRefreshToken,
      {
        id: userId,
        authTokenPayload: adminAuthToken
      },
      passwordChange
    )
  })

  it('fail to change another user password as viewer', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        async () => dbRefreshToken,
        {
          id: userId,
          authTokenPayload: viewerAuthToken
        },
        passwordChange
      )
    }, userMismatchError)
  })

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
