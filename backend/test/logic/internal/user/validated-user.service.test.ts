import { suite, test } from '../../../test.js'

import * as userService from '../../../../src/logic/internal/user/validated-user.service.js'

import type {
  CreateUserIf,
  CreateUserRequest,
  User,
  ValidateCreateUser,
} from '../../../../src/logic/user/user.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidSignInMethodError,
  invalidUserError,
  invalidUserIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import { testJwtIf } from '../../jwt-helper.js'
import {
  buildAuthTokenConfig,
  buildDbRefreshToken,
} from '../../auth/builders.js'
import { buildUser } from '../../user/builders.js'

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

const authTokenConfig = buildAuthTokenConfig()

const createUserRequest: CreateUserRequest = {
  role: 'admin',
  passwordSignInMethod: {
    username: 'admin',
    password: 'adminpassword',
  },
}

const passCreateValidation: ValidateCreateUser = (input: unknown) => {
  assertDeepEqual(input, validCreateUserRequest)
  return {
    errorCode: undefined,
    result: createUserRequest,
  }
}

const failCreateValidationWithUser: ValidateCreateUser = () => {
  return {
    errorCode: 'invalid-user',
    result: undefined,
  }
}

const failCreateValidationWithSignInMethod: ValidateCreateUser = () => {
  return {
    errorCode: 'invalid-sign-in-method',
    result: undefined,
  }
}

const passUserIdValidation = (id: string | undefined) => {
  assertEqual(id, user.id)
  return { errorCode: undefined, result: user.id } as const
}

const failUserIdValidation = () =>
  ({ errorCode: 'invalid-user-id', result: undefined }) as const

function notCalled(): any {
  throw new Error('not to be called')
}

suite('user validated service unit tests', () => {
  test('create user', async () => {
    await userService.createUser(
      testJwtIf,
      createIf,
      passCreateValidation,
      validCreateUserRequest,
      authTokenConfig,
      log,
    )
  })

  test('fail to create invalid user', async () => {
    await expectReject(async () => {
      await userService.createUser(
        testJwtIf,
        createIf,
        failCreateValidationWithUser,
        invalidUserRequest,
        authTokenConfig,
        log,
      )
    }, invalidUserError)
  })

  test('fail to create user with invalid sign-in method', async () => {
    await expectReject(async () => {
      await userService.createUser(
        testJwtIf,
        createIf,
        failCreateValidationWithSignInMethod,
        invalidUserRequest,
        authTokenConfig,
        log,
      )
    }, invalidSignInMethodError)
  })

  test('find user by id', async () => {
    const result = await userService.findUserById(
      async () => user,
      passUserIdValidation,
      user.id,
      log,
    )
    assertDeepEqual(result, user)
  })

  test('fail to find user by invalid id', async () => {
    await expectReject(async () => {
      await userService.findUserById(notCalled, failUserIdValidation, '', log)
    }, invalidUserIdError)
  })

  test('list users', async () => {
    const users: User[] = [user]
    const result = await userService.listUsers(async () => users, log)
    assertDeepEqual(result, users)
  })

  test('delete user', async () => {
    await userService.deleteUserById(
      deleteUserById,
      passUserIdValidation,
      user.id,
      log,
    )
  })

  test('fail to delete user with undefined id', async () => {
    await expectReject(async () => {
      await userService.deleteUserById(
        notCalled,
        failUserIdValidation,
        undefined,
        log,
      )
    }, invalidUserIdError)
  })
})
