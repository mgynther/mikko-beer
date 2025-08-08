import { describe, it } from 'node:test'

import * as userService from '../../../../src/core/internal/user/validated-user.service'

import type { AuthTokenConfig } from '../../../../src/core/auth/auth-token'
import type { CreateUserIf, CreateUserType } from '../../../../src/core/user/user'
import { Role } from '../../../../src/core/user/user'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidUserError,
  invalidUserIdError
} from '../../../../src/core/errors'
import { SignedInUser } from '../../../../src/core/internal/user/signed-in-user'

const validCreateUserRequest: CreateUserType = {
  user: {
    role: Role.admin
  },
  passwordSignInMethod: {
    username: 'admin',
    password: 'adminpassword'
  }
}

const user: SignedInUser = {
  user: {
    id: 'b69ea671-5adb-4a29-81cd-bfa590ec8eee',
    role: Role.admin,
    username: 'admin'
  },
  refreshToken: {
    refreshToken: '8f01cc63-c6cd-404b-90d0-23ae766043ee'
  },
  authToken: {
    authToken: 'aa479c2b-fc7e-4c46-89f4-f70cdabe2661'
  }
}

const invalidUserRequest = {
}

const createIf: CreateUserIf = {
  createAnonymousUser: async () => user.user,
  insertRefreshToken: async () => ({
    id: '58f535ef-8e6f-4345-a3ad-3b5920fc2a4b',
    userId: user.user.id
  }),
  addPasswordUserIf: {
    lockUserById: async () => ({
      id: user.user.id,
      role: user.user.role,
      username: null
    }),
    insertPasswordSignInMethod: async () => undefined,
    setUserUsername: async () => undefined
  }
}

const deleteUserById = async () => undefined

const authTokenConfig: AuthTokenConfig = {
  secret: 'this is secret',
  expiryDurationMin: 1
}

describe('user validated service unit tests', () => {
  it('create user', async () => {
    await userService.createUser(
      createIf,
      validCreateUserRequest,
      authTokenConfig,
      log
    )
  })

  it('fail to create invalid user', async () => {
    await expectReject(async () => {
      await userService.createUser(
        createIf,
        invalidUserRequest,
        authTokenConfig,
        log
      )
    }, invalidUserError)
  })

  it('delete user', async () => {
    await userService.deleteUserById(deleteUserById, user.user.id, log)
  })

  it('fail to delete user with undefined id', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(deleteUserById, undefined, log)
    }, invalidUserIdError)
  })
})
