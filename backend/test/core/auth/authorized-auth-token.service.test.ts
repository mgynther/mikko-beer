import * as jwt from '../../../src/core/auth/jwt'

import { expect } from 'earl'
import * as authTokenService from '../../../src/core/auth/authorized-auth-token.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'

import { Role } from '../../../src/core/user/user'
import { expectReject } from '../controller-error-helper'
import type {
  DbRefreshToken,
  RefreshToken
} from '../../../src/core/auth/refresh-token'
import { userMismatchError } from '../../../src/core/errors'

const adminAuthToken: AuthTokenPayload = {
  userId: '75c72a6f-95a0-475d-9b50-e926fe59ebc4',
  role: Role.admin,
  refreshTokenId: '38d569af-3996-4b6f-9632-5748481cc605'
}

const anotherAdminAuthToken: AuthTokenPayload = {
  userId: '0a3207ff-d0c3-43e8-9224-a0bbef6dcc58',
  role: Role.admin,
  refreshTokenId: 'c983ffcd-9d71-4b85-94de-0de595e6b1be'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '8460921e-08b1-4ab5-83d2-7fdde2b106fb',
  role: Role.viewer,
  refreshTokenId: 'e820508c-1c47-4676-8812-0ee2ec94c20e'
}

const adminDbRefreshToken: DbRefreshToken = {
  id: '2c6a0fb8-ca64-4859-9a7f-8a58d829ebde',
  userId: adminAuthToken.userId
}

const anotherAdminDbRefreshToken: DbRefreshToken = {
  id: '393aa97f-bbd4-4f58-9ab4-962964cd4e61',
  userId: anotherAdminAuthToken.userId
}

const viewerDbRefreshToken: DbRefreshToken = {
  id: '8c011ef7-13ac-4dae-b9cf-81c41ed7ed96',
  userId: adminAuthToken.userId
}

const authTokenSecret: string = 'this is secret'

const adminRefreshToken: RefreshToken = jwt.signRefreshToken({
  userId: adminAuthToken.userId,
  refreshTokenId: adminDbRefreshToken.id,
  isRefreshToken: true
}, authTokenSecret)

const anotherAdminRefreshToken: RefreshToken = jwt.signRefreshToken({
  userId: anotherAdminAuthToken.userId,
  refreshTokenId: anotherAdminDbRefreshToken.id,
  isRefreshToken: true
}, authTokenSecret)

const viewerRefreshToken: RefreshToken = jwt.signRefreshToken({
  userId: viewerAuthToken.userId,
  refreshTokenId: viewerDbRefreshToken.id,
  isRefreshToken: true
}, authTokenSecret)

const deleteRefreshToken = async () => undefined

describe('authorized auth token service unit tests', () => {
  it('delete refresh token as admin', async () => {
    await authTokenService.deleteRefreshToken(
      async () => adminDbRefreshToken,
      deleteRefreshToken,
      {
        authTokenPayload: adminAuthToken,
        id: adminAuthToken.userId
      }, adminRefreshToken, authTokenSecret)
  })

  // This is quite impractical in reality as another user's refresh token is
  // needed but possible and allowed nevertheless. Disabling would require
  // code specifically for this case so it's probably less work to just test
  // it.
  it('delete another admin\'s refresh token as admin', async () => {
    await authTokenService.deleteRefreshToken(
      async () => anotherAdminDbRefreshToken,
      deleteRefreshToken,
      {
        authTokenPayload: adminAuthToken,
        id: anotherAdminAuthToken.userId
      }, anotherAdminRefreshToken, authTokenSecret)
  })

  it('delete one\'s own refresh token as viewer', async () => {
    await authTokenService.deleteRefreshToken(
      async () => viewerDbRefreshToken,
      deleteRefreshToken,
      {
        authTokenPayload: viewerAuthToken,
        id: viewerAuthToken.userId
      }, viewerRefreshToken, authTokenSecret)
  })

  it('fail to delete admin refresh token as viewer', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        async () => viewerDbRefreshToken,
        deleteRefreshToken,
        {
          authTokenPayload: viewerAuthToken,
          id: adminAuthToken.userId
        }, viewerRefreshToken, authTokenSecret)
      }, userMismatchError)
  })

})
