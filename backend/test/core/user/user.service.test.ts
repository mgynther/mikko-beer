import { expect } from 'chai'

import { userNotFoundError } from '../../../src/core/errors'
import * as userService from '../../../src/core/user/user.service'
import {
  type AuthTokenConfig
} from "../../../src/core/authentication/auth-token"
import {
  type DbRefreshToken
} from "../../../src/core/authentication/refresh-token"
import {
    Role,
  type CreateAnonymousUserRequest,
  type User
} from "../../../src/core/user/user"

import { dummyLog as log } from '../dummy-log'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDuration: '5m',
  secret: authTokenSecret
}

const userId = 'f28f87af-106e-46af-8994-6fd9204bf85c'

const user: User = {
  id: userId,
  role: Role.admin,
  username: 'user'
}

describe('user service unit tests', () => {

  it('create anonymous user', async () => {
    async function create(
      request: CreateAnonymousUserRequest
    ): Promise<User> {
      expect(request.role).to.equal(user.role)
      return user
    }
    async function insertRefreshToken(
      requestUserId: string
    ): Promise<DbRefreshToken> {
      expect(requestUserId).to.equal(userId)
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
    expect(signedInUser.user).to.eql(user)
    expect(signedInUser.refreshToken.refreshToken).not.to.be.empty
    expect(signedInUser.authToken.authToken).not.to.be.empty
  })

  it('fail to find user that does not exist', async () => {
    const id = 'a52a35af-060a-4f43-ae00-c3d0dbaa8e6f'
    try {
      await userService.findUserById(async () => undefined, id, log)
    } catch (e) {
      expect(e).to.eql(userNotFoundError(id))
    }
  })

})
