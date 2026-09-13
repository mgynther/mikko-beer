import { describe, it } from 'node:test'

import * as service from '../../../../src/logic/internal/user/validated-sign-in-method.service.js'

import type { DbRefreshToken } from '../../../../src/logic/auth/refresh-token.js'

import type { AuthTokenConfig } from '../../../../src/logic/auth/auth-token.js'
import type { User } from '../../../../src/logic/user/user.js'
import {
  invalidCredentialsError,
  invalidPasswordChangeError,
  invalidSignInMethodError,
  invalidUserIdError,
} from '../../../../src/logic/errors.js'
import { expectReject } from '../../controller-error-helper.js'
import type {
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  UserPasswordHash,
  ValidatePasswordChange,
  ValidatePasswordSignInMethod,
} from '../../../../src/logic/user/sign-in-method.js'
import type { ValidateUserId } from '../../../../src/logic/user/user.js'

import { dummyLog as log } from '../../dummy-log.js'

const userId = '2bbcaed7-2b4d-4888-9a32-8573dc19fd56'

const user: User = {
  id: userId,
  role: 'admin',
  username: 'admin',
}

const authTokenSecret: string = 'this is secret'

const knownPassword = 'password'
const knownHash =
  '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

const dbRefreshToken: DbRefreshToken = {
  id: '187d17b9-0063-4257-af64-0710907679ba',
  userId,
}

const authTokenConfig: AuthTokenConfig = {
  secret: authTokenSecret,
  expiryDurationMin: 1,
}

const userPasswordHash: UserPasswordHash = {
  userId,
  passwordHash: knownHash,
  hashedAt: undefined,
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

const failSignInMethodValidation: ValidatePasswordSignInMethod = () => ({
  errorCode: 'invalid-sign-in-method',
  result: undefined,
})

function passPasswordChangeValidation(
  change: PasswordChange,
): ValidatePasswordChange {
  return () => ({ errorCode: undefined, result: change })
}

const failPasswordChangeValidation: ValidatePasswordChange = () => ({
  errorCode: 'invalid-password-change',
  result: undefined,
})

const passUserIdValidation: ValidateUserId = () => ({
  errorCode: undefined,
  result: userId,
})

const failUserIdValidation: ValidateUserId = () => ({
  errorCode: 'invalid-user-id',
  result: undefined,
})

describe('validated sign in method service unit tests', () => {
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

  it('fail to sign in with invalid request', async () => {
    await expectReject(async () => {
      await service.signInUsingPassword(
        signInUsingPasswordIf,
        failSignInMethodValidation,
        {
          username: 'admin',
        },
        authTokenConfig,
        log,
      )
    }, invalidSignInMethodError)
  })

  it('fail to sign in using wrong password', async () => {
    await expectReject(async () => {
      await service.signInUsingPassword(
        {
          ...signInUsingPasswordIf,
          verifySecret: async () => false,
        },
        passSignInMethodValidation({
          username: 'admin',
          password: 'wrong password',
        }),
        {
          username: 'admin',
          password: 'wrong password',
        },
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
  })

  it('change password', async () => {
    await service.changePassword(
      changePasswordUserIf,
      passPasswordChangeValidation(passwordChange),
      passUserIdValidation,
      userId,
      passwordChange,
      log,
    )
  })

  it('fail to change password with wrong old password', async () => {
    await expectReject(async () => {
      await service.changePassword(
        {
          ...changePasswordUserIf,
          verifySecret: async () => false,
        },
        passPasswordChangeValidation({
          ...passwordChange,
          oldPassword: 'wrong password',
        }),
        passUserIdValidation,
        userId,
        {
          ...passwordChange,
          oldPassword: 'wrong password',
        },
        log,
      )
    }, invalidCredentialsError)
  })

  it('fail to change password with invalid request', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        failPasswordChangeValidation,
        passUserIdValidation,
        userId,
        {
          oldPassword: knownPassword,
        },
        log,
      )
    }, invalidPasswordChangeError)
  })

  it('fail to change password with invalid user id', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        passPasswordChangeValidation(passwordChange),
        failUserIdValidation,
        undefined,
        passwordChange,
        log,
      )
    }, invalidUserIdError)
  })
})
