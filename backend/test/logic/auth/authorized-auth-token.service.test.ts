import { suite, test } from '../../test.js'

import * as authTokenService from '../../../src/logic/auth/authorized-auth-token.service.js'

import { expectReject } from '../controller-error-helper.js'
import type { RefreshTokenPayload } from '../../../src/logic/auth/refresh-token.js'
import {
  invalidCredentialsTokenError,
  invalidUserIdError,
  userMismatchError,
} from '../../../src/logic/errors.js'
import type { User, ValidateUserId } from '../../../src/logic/user/user.js'
import { mockFunction } from '../../mock.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload, buildDbRefreshToken } from './builders.js'
import { buildUser } from '../user/builders.js'

const validateUserId: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

const adminAuthToken = buildAuthTokenPayload({
  userId: '75c72a6f-95a0-475d-9b50-e926fe59ebc4',
  role: 'admin',
})

const anotherAdminAuthToken = buildAuthTokenPayload({
  userId: '0a3207ff-d0c3-43e8-9224-a0bbef6dcc58',
  role: 'admin',
})

const viewerAuthToken = buildAuthTokenPayload({
  userId: '8460921e-08b1-4ab5-83d2-7fdde2b106fb',
  role: 'viewer',
})

// Every refresh token a viewer's authorization looks up exists.
const dbRefreshToken = buildDbRefreshToken()

const adminRefreshToken: RefreshTokenPayload = {
  userId: adminAuthToken.userId,
  refreshTokenId: '2c6a0fb8-ca64-4859-9a7f-8a58d829ebde',
  isRefreshToken: true,
}

const anotherAdminRefreshToken: RefreshTokenPayload = {
  userId: anotherAdminAuthToken.userId,
  refreshTokenId: '393aa97f-bbd4-4f58-9ab4-962964cd4e61',
  isRefreshToken: true,
}

const viewerRefreshTokenId = '8c011ef7-13ac-4dae-b9cf-81c41ed7ed96'

const viewerRefreshToken: RefreshTokenPayload = {
  userId: viewerAuthToken.userId,
  refreshTokenId: viewerRefreshTokenId,
  isRefreshToken: true,
}

const deleteRefreshToken = async (): Promise<boolean> => true

async function lockUserById(userId: string): Promise<User> {
  return buildUser({ id: userId })
}

suite('authorized auth token service unit tests', () => {
  test('delete the refresh token of the payload', async () => {
    const deleteToken = mockFunction<
      [refreshTokenId: string],
      Promise<boolean>
    >(async () => true)
    await authTokenService.deleteRefreshToken(
      {
        lockUserById,
        findRefreshToken: async () => dbRefreshToken,
        deleteRefreshToken: deleteToken,
      },
      validateUserId,
      {
        authTokenPayload: viewerAuthToken,
        id: viewerAuthToken.userId,
      },
      viewerRefreshToken,
    )
    assertDeepEqual(
      deleteToken.mock.calls.map((call) => call.arguments),
      [[viewerRefreshTokenId]],
    )
  })

  test('fail to delete a refresh token already deleted', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        {
          lockUserById,
          findRefreshToken: async () => dbRefreshToken,
          deleteRefreshToken: async () => false,
        },
        validateUserId,
        {
          authTokenPayload: viewerAuthToken,
          id: viewerAuthToken.userId,
        },
        viewerRefreshToken,
      )
    }, invalidCredentialsTokenError)
  })

  test("fail to delete another user's refresh token as one's own", async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        {
          lockUserById,
          findRefreshToken: async () => dbRefreshToken,
          deleteRefreshToken,
        },
        validateUserId,
        {
          authTokenPayload: viewerAuthToken,
          id: viewerAuthToken.userId,
        },
        adminRefreshToken,
      )
    }, invalidCredentialsTokenError)
  })

  test('delete refresh token as admin', async () => {
    await authTokenService.deleteRefreshToken(
      {
        lockUserById,
        findRefreshToken: async () => dbRefreshToken,
        deleteRefreshToken,
      },
      validateUserId,
      {
        authTokenPayload: adminAuthToken,
        id: adminAuthToken.userId,
      },
      adminRefreshToken,
    )
  })

  // This is quite impractical in reality as another user's refresh token is
  // needed but possible and allowed nevertheless. Disabling would require
  // code specifically for this case so it's probably less work to just test
  // it.
  test("delete another admin's refresh token as admin", async () => {
    await authTokenService.deleteRefreshToken(
      {
        lockUserById,
        findRefreshToken: async () => dbRefreshToken,
        deleteRefreshToken,
      },
      validateUserId,
      {
        authTokenPayload: adminAuthToken,
        id: anotherAdminAuthToken.userId,
      },
      anotherAdminRefreshToken,
    )
  })

  test("delete one's own refresh token as viewer", async () => {
    await authTokenService.deleteRefreshToken(
      {
        lockUserById,
        findRefreshToken: async () => dbRefreshToken,
        deleteRefreshToken,
      },
      validateUserId,
      {
        authTokenPayload: viewerAuthToken,
        id: viewerAuthToken.userId,
      },
      viewerRefreshToken,
    )
  })

  test('fail to delete refresh token with invalid user id', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        {
          lockUserById,
          findRefreshToken: async () => dbRefreshToken,
          deleteRefreshToken,
        },
        () => ({ errorCode: 'invalid-user-id', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: adminAuthToken.userId,
        },
        adminRefreshToken,
      )
    }, invalidUserIdError)
  })

  test('fail to delete admin refresh token as viewer', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        {
          lockUserById,
          findRefreshToken: async () => dbRefreshToken,
          deleteRefreshToken,
        },
        validateUserId,
        {
          authTokenPayload: viewerAuthToken,
          id: adminAuthToken.userId,
        },
        viewerRefreshToken,
      )
    }, userMismatchError)
  })
})
