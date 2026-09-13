import { describe, it } from 'node:test'

import * as userService from '../../../../src/logic/internal/user/validated-user.service.js'

import type { AuthTokenConfig } from '../../../../src/logic/auth/auth-token.js'
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
import type { SignedInUser } from '../../../../src/logic/user/signed-in-user.js'
import { testJwtIf } from '../../jwt-helper.js'

const validCreateUserRequest = {
  user: {
    role: 'admin',
  },
  passwordSignInMethod: {
    username: 'admin',
    password: 'adminpassword',
  },
}

const user: SignedInUser = {
  user: {
    id: 'b69ea671-5adb-4a29-81cd-bfa590ec8eee',
    role: 'admin',
    username: 'admin',
  },
  refreshToken: {
    refreshToken: '8f01cc63-c6cd-404b-90d0-23ae766043ee',
  },
  authToken: {
    authToken: 'aa479c2b-fc7e-4c46-89f4-f70cdabe2661',
  },
}

const invalidUserRequest = {}

const createIf: CreateUserIf = {
  createAnonymousUser: async () => user.user,
  insertRefreshToken: async () => ({
    id: '58f535ef-8e6f-4345-a3ad-3b5920fc2a4b',
    userId: user.user.id,
  }),
  addPasswordUserIf: {
    lockUserById: async () => ({
      id: user.user.id,
      role: user.user.role,
      username: null,
    }),
    encryptSecret: async () => 'encrypted',
    insertPasswordSignInMethod: async () => undefined,
    setUserUsername: async () => undefined,
  },
}

const deleteUserById = async () => undefined

const authTokenConfig: AuthTokenConfig = {
  secret: 'this is secret',
  expiryDurationMin: 1,
}

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
  assertEqual(id, user.user.id)
  return { errorCode: undefined, result: user.user.id } as const
}

const failUserIdValidation = () =>
  ({ errorCode: 'invalid-user-id', result: undefined }) as const

function notCalled(): any {
  throw new Error('not to be called')
}

describe('user validated service unit tests', () => {
  it('create user', async () => {
    await userService.createUser(
      testJwtIf,
      createIf,
      passCreateValidation,
      validCreateUserRequest,
      authTokenConfig,
      log,
    )
  })

  it('fail to create invalid user', async () => {
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

  it('fail to create user with invalid sign-in method', async () => {
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

  it('find user by id', async () => {
    const result = await userService.findUserById(
      async () => user.user,
      passUserIdValidation,
      user.user.id,
      log,
    )
    assertDeepEqual(result, user.user)
  })

  it('fail to find user by invalid id', async () => {
    await expectReject(async () => {
      await userService.findUserById(notCalled, failUserIdValidation, '', log)
    }, invalidUserIdError)
  })

  it('list users', async () => {
    const users: User[] = [user.user]
    const result = await userService.listUsers(async () => users, log)
    assertDeepEqual(result, users)
  })

  it('delete user', async () => {
    await userService.deleteUserById(
      deleteUserById,
      passUserIdValidation,
      user.user.id,
      log,
    )
  })

  it('fail to delete user with undefined id', async () => {
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
