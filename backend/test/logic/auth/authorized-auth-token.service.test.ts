import { suite, test } from '../../test.js'

import * as jwt from '../../../src/logic/internal/auth/jwt.js'

import * as authTokenService from '../../../src/logic/auth/authorized-auth-token.service.js'

import { expectReject } from '../controller-error-helper.js'
import type { RefreshToken } from '../../../src/logic/auth/refresh-token.js'
import {
  invalidRefreshTokenError,
  invalidUserIdError,
  userMismatchError,
} from '../../../src/logic/errors.js'
import type { ValidateUserId } from '../../../src/logic/user/user.js'
import type { ValidateRefreshToken } from '../../../src/logic/auth/refresh-token.js'
import { testJwtIf } from '../jwt-helper.js'
import { buildAuthTokenPayload, buildDbRefreshToken } from './builders.js'

const validateUserId: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

function passRefreshTokenValidation(token: RefreshToken): ValidateRefreshToken {
  return () => ({ errorCode: undefined, result: token })
}

const failRefreshTokenValidation: ValidateRefreshToken = () => ({
  errorCode: 'invalid-refresh-token',
  result: undefined,
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

const authTokenSecret: string = 'this is secret'

const adminRefreshToken: RefreshToken = jwt.signRefreshToken(
  testJwtIf,
  {
    userId: adminAuthToken.userId,
    refreshTokenId: '2c6a0fb8-ca64-4859-9a7f-8a58d829ebde',
    isRefreshToken: true,
  },
  authTokenSecret,
)

const anotherAdminRefreshToken: RefreshToken = jwt.signRefreshToken(
  testJwtIf,
  {
    userId: anotherAdminAuthToken.userId,
    refreshTokenId: '393aa97f-bbd4-4f58-9ab4-962964cd4e61',
    isRefreshToken: true,
  },
  authTokenSecret,
)

const viewerRefreshToken: RefreshToken = jwt.signRefreshToken(
  testJwtIf,
  {
    userId: viewerAuthToken.userId,
    refreshTokenId: '8c011ef7-13ac-4dae-b9cf-81c41ed7ed96',
    isRefreshToken: true,
  },
  authTokenSecret,
)

const deleteRefreshToken = async () => undefined

suite('authorized auth token service unit tests', () => {
  test('delete refresh token as admin', async () => {
    await authTokenService.deleteRefreshToken(
      testJwtIf,
      async () => dbRefreshToken,
      deleteRefreshToken,
      passRefreshTokenValidation(adminRefreshToken),
      validateUserId,
      {
        authTokenPayload: adminAuthToken,
        id: adminAuthToken.userId,
      },
      adminRefreshToken,
      authTokenSecret,
    )
  })

  // This is quite impractical in reality as another user's refresh token is
  // needed but possible and allowed nevertheless. Disabling would require
  // code specifically for this case so it's probably less work to just test
  // it.
  test("delete another admin's refresh token as admin", async () => {
    await authTokenService.deleteRefreshToken(
      testJwtIf,
      async () => dbRefreshToken,
      deleteRefreshToken,
      passRefreshTokenValidation(anotherAdminRefreshToken),
      validateUserId,
      {
        authTokenPayload: adminAuthToken,
        id: anotherAdminAuthToken.userId,
      },
      anotherAdminRefreshToken,
      authTokenSecret,
    )
  })

  test("delete one's own refresh token as viewer", async () => {
    await authTokenService.deleteRefreshToken(
      testJwtIf,
      async () => dbRefreshToken,
      deleteRefreshToken,
      passRefreshTokenValidation(viewerRefreshToken),
      validateUserId,
      {
        authTokenPayload: viewerAuthToken,
        id: viewerAuthToken.userId,
      },
      viewerRefreshToken,
      authTokenSecret,
    )
  })

  test('fail to delete refresh token with invalid user id', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        testJwtIf,
        async () => dbRefreshToken,
        deleteRefreshToken,
        passRefreshTokenValidation(adminRefreshToken),
        () => ({ errorCode: 'invalid-user-id', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: adminAuthToken.userId,
        },
        adminRefreshToken,
        authTokenSecret,
      )
    }, invalidUserIdError)
  })

  test('fail to delete refresh token with invalid request', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        testJwtIf,
        async () => dbRefreshToken,
        deleteRefreshToken,
        failRefreshTokenValidation,
        validateUserId,
        {
          authTokenPayload: adminAuthToken,
          id: adminAuthToken.userId,
        },
        {},
        authTokenSecret,
      )
    }, invalidRefreshTokenError)
  })

  test('fail to delete admin refresh token as viewer', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        testJwtIf,
        async () => dbRefreshToken,
        deleteRefreshToken,
        passRefreshTokenValidation(viewerRefreshToken),
        validateUserId,
        {
          authTokenPayload: viewerAuthToken,
          id: adminAuthToken.userId,
        },
        viewerRefreshToken,
        authTokenSecret,
      )
    }, userMismatchError)
  })
})
