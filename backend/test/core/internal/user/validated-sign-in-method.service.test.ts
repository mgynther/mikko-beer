import { describe, it } from 'node:test'

import * as service
from '../../../../src/core/internal/user/validated-sign-in-method.service'

import type {
  DbRefreshToken
} from '../../../../src/core/auth/refresh-token'

import type {
  AuthTokenConfig
} from '../../../../src/core/auth/auth-token'
import { Role } from '../../../../src/core/user/user'
import type { User } from '../../../../src/core/user/user'
import {
  invalidCredentialsError,
  invalidPasswordChangeError,
  invalidSignInMethodError
} from '../../../../src/core/errors'
import { expectReject } from '../../controller-error-helper'
import type {
  ChangePasswordUserIf,
  PasswordChange,
  SignInUsingPasswordIf,
  UserPasswordHash
} from '../../../../src/core/user/sign-in-method'

const userId = '2bbcaed7-2b4d-4888-9a32-8573dc19fd56'

const user: User = {
  id: userId,
  role: Role.admin,
  username: 'admin'
}

const authTokenSecret: string = 'this is secret'

const knownPassword = 'password'
const knownHash = '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

const dbRefreshToken: DbRefreshToken = {
  id: '187d17b9-0063-4257-af64-0710907679ba',
  userId
}

const authTokenConfig: AuthTokenConfig = {
  secret: authTokenSecret,
  expiryDurationMin: 1
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

describe('validated sign in method service unit tests', () => {
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

  it('fail to sign in with invalid request', async () => {
    await expectReject(async () => {
      await service.signInUsingPassword(
        signInUsingPasswordIf,
        {
          username: 'admin'
        },
        authTokenConfig
      )
    }, invalidSignInMethodError)
  })

  it('fail to sign in using wrong password', async () => {
    await expectReject(async () => {
      await service.signInUsingPassword(
        signInUsingPasswordIf,
        {
          username: 'admin',
          password: 'wrong password'
        },
        authTokenConfig
      )
    }, invalidCredentialsError)
  })

  it('change password', async () => {
    await service.changePassword(
      changePasswordUserIf,
      userId,
      passwordChange
    )
  })

  it('fail to change password with wrong old password', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        userId,
        {
          ...passwordChange,
          oldPassword: 'wrong password'
        }
      )
    }, invalidCredentialsError)
  })

  it('fail to change password with invalid request', async () => {
    await expectReject(async () => {
      await service.changePassword(
        changePasswordUserIf,
        userId,
        {
          oldPassword: knownPassword
        }
      )
    }, invalidPasswordChangeError)
  })
})
