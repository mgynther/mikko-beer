import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { userNotFoundError } from '../../../../src/core/errors'
import * as userService from '../../../../src/core/internal/user/user.service'
import type { AuthTokenConfig } from "../../../../src/core/auth/auth-token"
import type { DbRefreshToken } from "../../../../src/core/auth/refresh-token"
import type {
  CreateAnonymousUserRequest,
  User
} from "../../../../src/core/user/user"

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDurationMin: 5,
  secret: authTokenSecret
}

const userId = 'f28f87af-106e-46af-8994-6fd9204bf85c'

const user: User = {
  id: userId,
  role: 'admin',
  username: 'user'
}

describe('user service unit tests', () => {

  it('create anonymous user', async () => {
    async function create(
      request: CreateAnonymousUserRequest
    ): Promise<User> {
      assert.equal(request.role, user.role)
      return user
    }
    async function insertRefreshToken(
      requestUserId: string
    ): Promise<DbRefreshToken> {
      assert.equal(requestUserId, userId)
      return {
        id: '0586c701-e053-46bf-b599-346093989140',
        userId
      }
    }
    const signedInUser = await userService.createAnonymousUser(
      create,
      insertRefreshToken,
      user.role,
      authTokenConfig,
      log
    )
    assertDeepEqual(signedInUser.user, user)
    assert.notEqual(signedInUser.refreshToken.refreshToken, '')
    assert.notEqual(signedInUser.authToken.authToken, '')
  })

  it('fail to find user that does not exist', async () => {
    const id = 'a52a35af-060a-4f43-ae00-c3d0dbaa8e6f'
    expectReject(async () => {
      await userService.findUserById(async () => undefined, id, log)
    }, userNotFoundError(id))
  })

})
