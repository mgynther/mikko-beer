import { expect } from 'earl'
import * as userService from '../../../src/core/user/authorized-user.service'

import type { AuthTokenConfig, AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type { CreateUserIf, CreateUserType } from '../../../src/core/user/user'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidUserError,
  invalidUserIdError,
  noRightsError,
  userMismatchError
} from '../../../src/core/errors'
import type { SignedInUser } from '../../../src/core/internal/user/signed-in-user'
import type { DbRefreshToken } from '../../../src/core/auth/refresh-token'

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
  expiryDurationMin: 1
}

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

  it('fail to create user as viewer', async () => {
    await expectReject(async () => {
      await userService.createUser(
        createIf,
        viewerAuthToken,
        validCreateUserRequest,
        authTokenConfig,
        log
      )
    }, noRightsError)
  })

  it('fail to create invalid user as admin', async () => {
    await expectReject(async () => {
      await userService.createUser(
        createIf,
        adminAuthToken,
        invalidUserRequest,
        authTokenConfig,
        log
      )
    }, invalidUserError)
  })

  it('delete user as admin', async () => {
    await userService.deleteUserById(deleteUserById, {
      authTokenPayload: adminAuthToken,
      id: user.user.id
    }, log)
  })

  it('fail to delete user as viewer', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(deleteUserById, {
        authTokenPayload: viewerAuthToken,
        id: user.user.id
      }, log)
    }, noRightsError)
  })

  it('fail to delete user with undefined id as admin', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(deleteUserById, {
        authTokenPayload: adminAuthToken,
        id: undefined
      }, log)
    }, invalidUserIdError)
  })

  const dbRefreshToken: DbRefreshToken = {
    id: '0cc90f4e-706c-4edc-a58c-67f8008cf27e',
    userId: user.user.id
  }

  it('find viewer user as admin', async () => {
    const user = {
      id: viewerAuthToken.userId,
      role: viewerAuthToken.role,
      username: 'viewer'
    }
    const result = await userService.findUserById(
      async () => (user),
      async () => dbRefreshToken,
      {
        authTokenPayload: adminAuthToken,
        id: user.id
      },
      log
    )
    expect(result).toEqual(user)
  })

  it('fail to find admin user as viewer', async () => {
    const user = {
      id: adminAuthToken.userId,
      role: adminAuthToken.role,
      username: 'admin'
    }
    await expectReject(async () => {
      await userService.findUserById(
        async () => (user),
        async () => dbRefreshToken,
        {
          authTokenPayload: viewerAuthToken,
          id: user.id
        },
        log
      )
    }, userMismatchError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find self user as ${token.role}`, async () => {
      const user = {
        id: token.userId,
        role: token.role,
        username: 'doesnotmatter'
      }
      const result = await userService.findUserById(
        async () => (user),
        async () => dbRefreshToken,
        {
          authTokenPayload: token,
          id: token.userId
        },
        log
      )
      expect(result).toEqual(user)
    })

    it(`list user as ${token.role}`, async () => {
      const result = await userService.listUsers(
        async () => [user.user],
        token,
        log
      )
      expect(result).toEqual([user.user])
    })
  })
})
