import { suite, test } from '../../test.js'

import * as service from '../../../src/logic/user/authorized-sign-in-method.service.js'

import type {
  DbRefreshToken,
  RefreshTokenPayload,
} from '../../../src/logic/auth/refresh-token.js'

import type { RefreshTokensIf } from '../../../src/logic/user/authorized-sign-in-method.service.js'
import {
  invalidCredentialsError,
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
import type { User, ValidateUserId } from '../../../src/logic/user/user.js'

import { dummyLog as log } from '../dummy-log.js'
import { mockFunction } from '../../mock.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../assert.js'
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

const refreshTokenPayload: RefreshTokenPayload = {
  userId,
  refreshTokenId,
  isRefreshToken: true,
}

const dbRefreshToken = buildDbRefreshToken()

const refreshTokensIf: RefreshTokensIf = {
  deleteRefreshToken: async () => true,
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

const validateUserId: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

function notCalled(): any {
  throw new Error('not to be called')
}

suite('authorized sign in method service unit tests', () => {
  test('sign in using password', async () => {
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

  test('change password', async () => {
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

  test('fail to change another user password as viewer', async () => {
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

  test('refresh tokens with the refresh token of the payload', async () => {
    const deleteRefreshToken = mockFunction<
      [refreshTokenId: string],
      Promise<boolean>
    >(async () => true)

    const tokens = await service.refreshTokens(
      testJwtIf,
      { ...refreshTokensIf, deleteRefreshToken },
      userId,
      refreshTokenPayload,
      authTokenConfig,
    )

    assertDeepEqual(
      deleteRefreshToken.mock.calls.map((call) => call.arguments),
      [[refreshTokenId]],
    )
    assertTruthy(tokens.auth.authToken)
    assertTruthy(tokens.refresh.refreshToken)
  })

  test("fail to refresh tokens with another user's refresh token", async () => {
    const anotherUserId = 'e0ad6a86-4dc4-4f4e-a6e5-f0a6f0f38f51'
    const lockUserById = mockFunction<
      [userId: string],
      Promise<User | undefined>
    >(async () => user)

    await expectReject(async () => {
      await service.refreshTokens(
        testJwtIf,
        { ...refreshTokensIf, lockUserById },
        anotherUserId,
        refreshTokenPayload,
        authTokenConfig,
      )
    }, invalidCredentialsTokenError)
    assertEqual(lockUserById.mock.callCount(), 0)
  })

  test('fail to refresh tokens with a refresh token already used', async () => {
    const insertRefreshToken = mockFunction<
      [userId: string],
      Promise<DbRefreshToken>
    >(async () => dbRefreshToken)

    await expectReject(async () => {
      await service.refreshTokens(
        testJwtIf,
        {
          ...refreshTokensIf,
          deleteRefreshToken: async () => false,
          insertRefreshToken,
        },
        userId,
        refreshTokenPayload,
        authTokenConfig,
      )
    }, invalidCredentialsTokenError)
    assertEqual(insertRefreshToken.mock.callCount(), 0)
  })

  test('fail to refresh tokens of a user that no longer exists', async () => {
    await expectReject(async () => {
      await service.refreshTokens(
        testJwtIf,
        { ...refreshTokensIf, lockUserById: async () => undefined },
        userId,
        refreshTokenPayload,
        authTokenConfig,
      )
    }, invalidCredentialsError)
  })
})
