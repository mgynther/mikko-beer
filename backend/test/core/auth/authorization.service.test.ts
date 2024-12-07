import type {
  DbRefreshToken
} from '../../../src/core/auth/refresh-token'
import * as authorizationService from '../../../src/core/auth/authorization.service'
import { Role, type User } from '../../../src/core/user/user'
import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import {
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from '../../../src/core/errors'
import { expectReject, expectThrow } from '../controller-error-helper'

const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin: User = {
  id: '185c5a57-c29f-456f-9dac-db29a7de96c3',
  role: Role.admin,
  username: 'admin'
}

const otherAdmin: User = {
  id: 'e8d718a3-0a85-41f3-9040-b7aff4470987',
  role: Role.admin,
  username: 'otheradmin'
}

const viewer: User = {
  id: '2a036606-c4cc-46b6-8093-4bf3835fff85',
  role: Role.viewer,
  username: 'viewer'
}

const otherViewer: User = {
  id: 'ca8c2111-db26-472a-bdf5-4c5fa1516425',
  role: Role.viewer,
  username: 'otherviewer'
}

async function findRefreshToken(
  userId: string,
  refreshTokenId: string
): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId
  }
}

async function notCalledFindRefreshToken(
): Promise<DbRefreshToken | undefined> {
  throw new Error('must not be called')
}

async function dontFindRefresToken(
): Promise<undefined> {
  return undefined
}

async function createAuthTokenPayload(user: User): Promise<AuthTokenPayload> {
  return {
    userId: user.id,
    role: user.role,
    refreshTokenId
  }
}

describe('authorization service unit tests', () => {

  it('authorize admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authorizationService.authorizeAdmin(payload)
  })

  it('fail to authorize admin as viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    expectThrow(() => {
      authorizationService.authorizeAdmin(payload)
    }, noRightsError)
  })

  it('authorize viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    authorizationService.authorizeViewer(payload)
  })

  it('authorize viewer as admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authorizationService.authorizeViewer(payload)
  })

  it('fail to authorize user without user id', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    expectReject(async () => {
      await authorizationService.authorizeUser(
        '',
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, noUserIdParameterError)
  })

  it('authorize self user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      admin.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authorize other admin user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      otherAdmin.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authorize viewer user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      viewer.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authorize self user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      viewer.id,
      authTokenPayload,
      findRefreshToken
    )
  })

  it('fail to authorize admin user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authorizationService.authorizeUser(
        admin.id,
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, userMismatchError)
  })

  it('fail to authorize other viewer user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authorizationService.authorizeUser(
        otherViewer.id,
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, userMismatchError)
  })

  it('fail to authorize viewer when refresh token not found', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authorizationService.authorizeUser(
        viewer.id,
        authTokenPayload,
        dontFindRefresToken
      )
    }, userOrRefreshTokenNotFoundError)
  })
})
