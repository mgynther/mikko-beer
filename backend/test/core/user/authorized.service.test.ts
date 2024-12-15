import * as userService from '../../../src/core/user/authorized-user.service'

import type { AuthTokenConfig, AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type { CreateUserType } from '../../../src/core/user/user'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  ControllerError,
  invalidUserError,
  invalidUserIdError,
  noRightsError
} from '../../../src/core/errors'
import type {
  CreateUserIf
} from '../../../src/core/user/authorized-user.service'
import { SignedInUser } from '../../../src/core/user/signed-in-user'

const validCreateUserRequest: CreateUserType = {
  user: {
    role: Role.admin
  },
  passwordSignInMethod: {
    username: 'admin',
    password: 'admin'
  }
}

const user: SignedInUser = {
  user: {
    id: '565dc891-0e04-4813-a6c6-dbd5535a80ff',
    role: Role.admin,
    username: 'admin'
  },
  refreshToken: {
    refreshToken: '30835b0c-4522-4874-b216-78867e2478fc'
  },
  authToken: {
    authToken: '739b4328-e670-47ba-84d8-dd7470ace0bd'
  }
}

const invalidUserRequest = {
}

const createIf: CreateUserIf = {
  createAnonymousUser: async () => user.user,
  insertRefreshToken: async () => ({
    id: 'c7473953-1c2d-4945-b00f-174f371d6e57',
    userId: user.user.id
  }),
  addPasswordSignInMethod: async () => '',
}

const deleteUserById = async () => undefined

const adminAuthToken: AuthTokenPayload = {
  userId: 'e5390bee-7afb-42d6-9f1c-6c04b72d03d1',
  role: Role.admin,
  refreshTokenId: 'e72a8f54-f71c-4fb4-8e93-bf65bef4e31e'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: 'f793fe89-cbb1-41d2-b7fd-fd60de26c6ca',
  role: Role.viewer,
  refreshTokenId: '4e287a07-d115-4e10-b414-f2a106d49765'
}

const authTokenConfig: AuthTokenConfig = {
  secret: 'this is secret',
  expiryDuration: '1min'
}

interface CreateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  error: ControllerError
  title: string
}

const createRejectionTests: CreateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validCreateUserRequest,
    error: noRightsError,
    title: 'fail to create user as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidUserRequest,
    error: noRightsError,
    title: 'fail to create invalid user as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidUserRequest,
    error: invalidUserError,
    title: 'fail to create invalid user as admin'
  }
]

interface DeleteRejectionTest {
  token: AuthTokenPayload
  userId: string | undefined
  error: ControllerError
  title: string
}

const deleteRejectionTests: DeleteRejectionTest[] = [
  {
    token: viewerAuthToken,
    userId: user.user.id,
    error: noRightsError,
    title: 'fail to delete user as viewer'
  },
  {
    token: viewerAuthToken,
    userId: user.user.id,
    error: noRightsError,
    title: 'fail to delete invalid user as viewer'
  },
  {
    token: viewerAuthToken,
    userId: undefined,
    error: noRightsError,
    title: 'fail to delete user with undefined id as viewer'
  },
  {
    token: adminAuthToken,
    userId: undefined,
    error: invalidUserIdError,
    title: 'fail to delete user with undefined id as admin'
  },
]

describe('user authorized service unit tests', () => {
  it('create user as admin', async () => {
    await userService.createUser(
      createIf,
      adminAuthToken,
      validCreateUserRequest,
      authTokenConfig,
      log
    )
  })

  createRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await userService.createUser(
          createIf,
          testCase.token,
          testCase.body,
          authTokenConfig,
          log
        )
      }, testCase.error)
    })
  })

  it('delete user as admin', async () => {
    await userService.deleteUserById(deleteUserById, {
      authTokenPayload: adminAuthToken,
      id: user.user.id
    }, log)
  })

  deleteRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await userService.deleteUserById(deleteUserById, {
          authTokenPayload: testCase.token,
          id: testCase.userId
        }, log)
      }, testCase.error)
    })
  })
})
