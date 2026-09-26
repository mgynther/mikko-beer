import { suite, test } from '../../../test.js'

import { userNotFoundError } from '../../../../src/logic/errors.js'
import * as userService from '../../../../src/logic/internal/user/user.service.js'
import type { DbRefreshToken } from '../../../../src/logic/auth/refresh-token'
import type {
  CreateAnonymousUserRequest,
  User,
} from '../../../../src/logic/user/user'

import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../../../assert.js'
import { testJwtIf } from '../../jwt-helper.js'
import {
  buildAuthTokenConfig,
  buildDbRefreshToken,
} from '../../auth/builders.js'
import { buildUser } from '../../user/builders.js'

const authTokenConfig = buildAuthTokenConfig()

const user = buildUser()

suite('user service unit tests', () => {
  test('create anonymous user', async () => {
    async function create(request: CreateAnonymousUserRequest): Promise<User> {
      assertEqual(request.role, user.role)
      return user
    }
    async function insertRefreshToken(
      requestUserId: string,
    ): Promise<DbRefreshToken> {
      assertEqual(requestUserId, user.id)
      return buildDbRefreshToken({ userId: user.id })
    }
    const signedInUser = await userService.createAnonymousUser(
      testJwtIf,
      create,
      insertRefreshToken,
      user.role,
      authTokenConfig,
      log,
    )
    assertDeepEqual(signedInUser.user, user)
    assertTruthy(signedInUser.refreshToken.refreshToken)
    assertTruthy(signedInUser.authToken.authToken)
  })

  test('fail to find user that does not exist', async () => {
    const id = 'a52a35af-060a-4f43-ae00-c3d0dbaa8e6f'
    await expectReject(async () => {
      await userService.findUserById(async () => undefined, id, log)
    }, userNotFoundError(id))
  })
})
