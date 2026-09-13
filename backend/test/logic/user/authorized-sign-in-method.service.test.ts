import { describe, it } from 'node:test'

import * as jwt from '../../../src/logic/internal/auth/jwt.js'

import * as service from '../../../src/logic/user/authorized-sign-in-method.service.js'

import type {
  DbRefreshToken,
  RefreshToken,
} from '../../../src/logic/auth/refresh-token.js'

import type { RefreshTokensIf } from '../../../src/logic/user/authorized-sign-in-method.service.js'
import type {
  AuthTokenConfig,
  AuthTokenPayload,
} from '../../../src/logic/auth/auth-token.js'
import type { User } from '../../../src/logic/user/user.js'
import {
  invalidCredentialsTokenError,
  userMismatchError,
} from '../../../src/logic/errors.js'
import { expectReject } from '../controller-error-helper.js'
import type {
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  UserPasswordHash,
  ValidatePasswordChange,
  ValidatePasswordSignInMethod,
} from '../../../src/logic/user/sign-in-method.js'
import type { ValidateUserId } from '../../../src/logic/user/user.js'

import { dummyLog as log } from '../dummy-log.js'

const userId = '589e0cf9-7a2d-4c7e-8d62-6e67f32cb3ce'
const refreshTokenId = 'c6697088-c417-4dee-988d-c018b07527f7'

const user: User = {
  id: userId,
  role: 'admin',
  username: 'admin',
}

const adminAuthToken: AuthTokenPayload = {
  userId,
  role: 'admin',
  refreshTokenId,
}

const viewerAuthToken: AuthTokenPayload = {
  userId: 'dbf43779-cc8b-4097-bca2-af0b8e6da64b',
  role: 'viewer',
  refreshTokenId: '0054d008-2a4c-4c84-af92-886df7dd38fe',
}

const authTokenSecret: string = 'this is secret'

const knownPassword = 'password'
const knownHash =
  '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

const validRefreshToken: RefreshToken = jwt.signRefreshToken(
  {
    userId,
    refreshTokenId,
    isRefreshToken: true,
  },
  authTokenSecret,
)

const dbRefreshToken: DbRefreshToken = {
  id: 'e6190cc2-630e-4f23-bc70-aa76254ef28b',
  userId,
}

const refreshTokensIf: RefreshTokensIf = {
  deleteRefreshToken: async () => undefined,
  insertRefreshToken: async () => dbRefreshToken,
  lockUserById: async () => user,
}

const authTokenConfig: AuthTokenConfig = {
  secret: authTokenSecret,
  expiryDurationMin: 1,
}

const userPasswordHash: UserPasswordHash = {
  userId,
  passwordHash: knownHash,
  hashedAt: new Date('2022-12-12T10:00:01.023Z'),
}

const signInUsingPasswordIf: SignInUsingPasswordIf = {
  lockUserByUsername: async () => user,
  findPasswordSignInMethod: async () => userPasswordHash,
  verifySecret: async () => true,
  encryptSecret: async () => 'encrypted',
  insertRefreshToken: async () => dbRefreshToken,
  updatePassword: async () => undefined,
}

const changePasswordUserIf: ChangePasswordUserIf = {
  lockUserById: async () => user,
  findPasswordSignInMethod: async () => userPasswordHash,
  verifySecret: async () => true,
  encryptSecret: async () => 'encrypted',
  updatePassword: async () => undefined,
}

const passwordChange: PasswordChange = {
  oldPassword: knownPassword,
  newPassword: 'this is new password',
}

function passSignInMethodValidation(
  method: PasswordSignInMethod,
): ValidatePasswordSignInMethod {
  return () => ({ errorCode: undefined, result: method })
}

function passPasswordChangeValidation(
  change: PasswordChange,
): ValidatePasswordChange {
  return () => ({ errorCode: undefined, result: change })
}

const validateUserId: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

function notCalled(): any {
  throw new Error('not to be called')
}

describe('authorized sign in method service unit tests', () => {
  it('sign in using password', async () => {
    await service.signInUsingPassword(
      signInUsingPasswordIf,
      passSignInMethodValidation({
        username: 'admin',
        password: knownPassword,
      }),
      {
        username: 'admin',
        password: knownPassword,
      },
      authTokenConfig,
      log,
    )
  })

  it('change password', async () => {
    await service.changePassword(
      changePasswordUserIf,
      passPasswordChangeValidation(passwordChange),
      validateUserId,
      async () => dbRefreshToken,
      {
        id: userId,
        authTokenPayload: adminAuthToken,
      },
      passwordChange,
      log,
    )
  })

  it('fail to change another user password as viewer', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        notCalled,
        notCalled,
        async () => dbRefreshToken,
        {
          id: userId,
          authTokenPayload: viewerAuthToken,
        },
        passwordChange,
        log,
      )
    }, userMismatchError)
  })

  it('refresh tokens with valid refresh token', async () => {
    await service.refreshTokens(
      refreshTokensIf,
      userId,
      validRefreshToken,
      authTokenConfig,
    )
  })

  it('fail to refresh tokens with invalid refresh token', async () => {
    await expectReject(async () => {
      await service.refreshTokens(
        refreshTokensIf,
        userId,
        { refreshToken: 'this is invalid' },
        authTokenConfig,
      )
    }, invalidCredentialsTokenError)
  })
})
