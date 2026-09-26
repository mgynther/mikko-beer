import { describe, it } from 'node:test'

import * as jwt from '../../../src/logic/internal/auth/jwt.js'

import * as service from '../../../src/logic/user/authorized-sign-in-method.service.js'

import type { RefreshToken } from '../../../src/logic/auth/refresh-token.js'

import type { RefreshTokensIf } from '../../../src/logic/user/authorized-sign-in-method.service.js'
import {
  invalidCredentialsTokenError,
  invalidRefreshTokenError,
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
import type { ValidateRefreshToken } from '../../../src/logic/auth/refresh-token.js'

import { dummyLog as log } from '../dummy-log.js'
import { testJwtIf } from '../jwt-helper.js'
import {
  buildAuthTokenConfig,
  buildAuthTokenPayload,
  buildDbRefreshToken,
} from '../auth/builders.js'
import { buildUser } from './builders.js'

const userId = '589e0cf9-7a2d-4c7e-8d62-6e67f32cb3ce'
const refreshTokenId = 'c6697088-c417-4dee-988d-c018b07527f7'

const user = buildUser({ id: userId })

const adminAuthToken = buildAuthTokenPayload({ userId, role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({
  userId: 'dbf43779-cc8b-4097-bca2-af0b8e6da64b',
  role: 'viewer',
})

const authTokenSecret: string = 'this is secret'

const knownPassword = 'password'
const knownHash =
  '$scrypt$ln=14,r=8,p=1$LSFeH5c5d4Fav49HIqHpiQ$7biLfcxLU9RUv+TVf2fM3s7wY4DJiOfzavESywH5/iFFItGPC9zylXDHCouIE3eJpRbFepfVanqB+inf92yIdA'

const validRefreshToken: RefreshToken = jwt.signRefreshToken(
  testJwtIf,
  {
    userId,
    refreshTokenId,
    isRefreshToken: true,
  },
  authTokenSecret,
)

const dbRefreshToken = buildDbRefreshToken()

const refreshTokensIf: RefreshTokensIf = {
  deleteRefreshToken: async () => undefined,
  insertRefreshToken: async () => dbRefreshToken,
  lockUserById: async () => user,
}

const authTokenConfig = buildAuthTokenConfig({ secret: authTokenSecret })

const userPasswordHash: UserPasswordHash = {
  userId,
  passwordHash: knownHash,
}

const signInUsingPasswordIf: SignInUsingPasswordIf = {
  lockUserByUsername: async () => user,
  findPasswordSignInMethod: async () => userPasswordHash,
  verifySecret: async () => true,
  rejectSecret: async () => undefined,
  needsRehash: () => false,
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

function passRefreshTokenValidation(token: RefreshToken): ValidateRefreshToken {
  return () => ({ errorCode: undefined, result: token })
}

const failRefreshTokenValidation: ValidateRefreshToken = () => ({
  errorCode: 'invalid-refresh-token',
  result: undefined,
})

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
      testJwtIf,
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
      testJwtIf,
      refreshTokensIf,
      passRefreshTokenValidation(validRefreshToken),
      userId,
      validRefreshToken,
      authTokenConfig,
    )
  })

  it('fail to refresh tokens with invalid refresh token', async () => {
    await expectReject(async () => {
      await service.refreshTokens(
        testJwtIf,
        refreshTokensIf,
        passRefreshTokenValidation({ refreshToken: 'this is invalid' }),
        userId,
        { refreshToken: 'this is invalid' },
        authTokenConfig,
      )
    }, invalidCredentialsTokenError)
  })

  it('fail to refresh tokens with invalid request', async () => {
    await expectReject(async () => {
      await service.refreshTokens(
        testJwtIf,
        refreshTokensIf,
        failRefreshTokenValidation,
        userId,
        {},
        authTokenConfig,
      )
    }, invalidRefreshTokenError)
  })
})
