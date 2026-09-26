import { suite, test } from '../../test.js'

import * as userService from '../../../src/logic/user/authorized-user.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  CreateUserIf,
  CreateUserRequest,
  ValidateCreateUser,
  ValidateUserId,
} from '../../../src/logic/user/user.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidUserError,
  invalidUserIdError,
  noRightsError,
  userMismatchError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { testJwtIf } from '../jwt-helper.js'
import {
  buildAuthTokenConfig,
  buildAuthTokenPayload,
  buildDbRefreshToken,
} from '../auth/builders.js'
import { buildUser } from './builders.js'

const validCreateUserRequest = {
  user: {
    role: 'admin',
  },
  passwordSignInMethod: {
    username: 'admin',
    password: 'adminpassword',
  },
}

const user = buildUser()

const invalidUserRequest = {}

const createIf: CreateUserIf = {
  createAnonymousUser: async () => user,
  insertRefreshToken: async () => buildDbRefreshToken({ userId: user.id }),
  addPasswordUserIf: {
    // A user without a username has no password sign-in method yet.
    lockUserById: async () => ({ ...user, username: null }),
    encryptSecret: async () => 'encrypted',
    insertPasswordSignInMethod: async () => undefined,
    setUserUsername: async () => undefined,
  },
}

const deleteUserById = async () => undefined

const adminAuthToken = buildAuthTokenPayload({
  userId: 'e5390bee-7afb-42d6-9f1c-6c04b72d03d1',
  role: 'admin',
})

const viewerAuthToken = buildAuthTokenPayload({
  userId: 'f793fe89-cbb1-41d2-b7fd-fd60de26c6ca',
  role: 'viewer',
})

const authTokenConfig = buildAuthTokenConfig()

const createUserRequest: CreateUserRequest = {
  role: 'admin',
  passwordSignInMethod: {
    username: 'admin',
    password: 'adminpassword',
  },
}

const passCreateValidation: ValidateCreateUser = () => ({
  errorCode: undefined,
  result: createUserRequest,
})

const failCreateValidation: ValidateCreateUser = () => ({
  errorCode: 'invalid-user',
  result: undefined,
})

const passUserIdValidation: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

const failUserIdValidation: ValidateUserId = () => ({
  errorCode: 'invalid-user-id',
  result: undefined,
})

function notCalled(): any {
  throw new Error('not to be called')
}

suite('user authorized service unit tests', () => {
  test('create user as admin', async () => {
    await userService.createUser(
      testJwtIf,
      createIf,
      passCreateValidation,
      adminAuthToken,
      validCreateUserRequest,
      authTokenConfig,
      log,
    )
  })

  test('fail to create user as viewer', async () => {
    await expectReject(async () => {
      await userService.createUser(
        testJwtIf,
        createIf,
        notCalled,
        viewerAuthToken,
        validCreateUserRequest,
        authTokenConfig,
        log,
      )
    }, noRightsError)
  })

  test('fail to create invalid user as admin', async () => {
    await expectReject(async () => {
      await userService.createUser(
        testJwtIf,
        createIf,
        failCreateValidation,
        adminAuthToken,
        invalidUserRequest,
        authTokenConfig,
        log,
      )
    }, invalidUserError)
  })

  test('delete user as admin', async () => {
    await userService.deleteUserById(
      deleteUserById,
      passUserIdValidation,
      {
        authTokenPayload: adminAuthToken,
        id: user.id,
      },
      log,
    )
  })

  test('fail to delete user as viewer', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(
        deleteUserById,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: user.id,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to delete user with undefined id as admin', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(
        deleteUserById,
        failUserIdValidation,
        {
          authTokenPayload: adminAuthToken,
          id: undefined,
        },
        log,
      )
    }, invalidUserIdError)
  })

  const dbRefreshToken = buildDbRefreshToken()

  test('find viewer user as admin', async () => {
    const user = buildUser({ id: viewerAuthToken.userId })
    const result = await userService.findUserById(
      async () => user,
      passUserIdValidation,
      async () => dbRefreshToken,
      {
        authTokenPayload: adminAuthToken,
        id: user.id,
      },
      log,
    )
    assertDeepEqual(result, user)
  })

  test('fail to find admin user as viewer', async () => {
    const user = buildUser({ id: adminAuthToken.userId })
    await expectReject(async () => {
      await userService.findUserById(
        async () => user,
        passUserIdValidation,
        async () => dbRefreshToken,
        {
          authTokenPayload: viewerAuthToken,
          id: user.id,
        },
        log,
      )
    }, userMismatchError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    test(`find self user as ${token.role}`, async () => {
      const user = buildUser({ id: token.userId })
      const result = await userService.findUserById(
        async () => user,
        passUserIdValidation,
        async () => dbRefreshToken,
        {
          authTokenPayload: token,
          id: token.userId,
        },
        log,
      )
      assertDeepEqual(result, user)
    })

    test(`list user as ${token.role}`, async () => {
      const result = await userService.listUsers(async () => [user], token, log)
      assertDeepEqual(result, [user])
    })
  })
})
