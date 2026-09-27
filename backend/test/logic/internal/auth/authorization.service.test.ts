import { suite, test } from '../../../test.js'

import type { DbRefreshToken } from '../../../../src/logic/auth/refresh-token.js'
import * as authorizationService from '../../../../src/logic/internal/auth/authorization.service.js'
import type { User } from '../../../../src/logic/user/user.js'
import type { AuthTokenPayload } from '../../../../src/logic/auth/auth-token.js'
import {
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError,
} from '../../../../src/logic/errors.js'
import { expectReject, expectThrow } from '../../controller-error-helper.js'
import { assertDeepEqual } from '../../../assert.js'
import { buildUser } from '../../user/builders.js'

const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin = buildUser({
  id: '185c5a57-c29f-456f-9dac-db29a7de96c3',
  role: 'admin',
})

const otherAdmin = buildUser({
  id: 'e8d718a3-0a85-41f3-9040-b7aff4470987',
  role: 'admin',
})

const viewer = buildUser({
  id: '2a036606-c4cc-46b6-8093-4bf3835fff85',
  role: 'viewer',
})

const otherViewer = buildUser({
  id: 'ca8c2111-db26-472a-bdf5-4c5fa1516425',
  role: 'viewer',
})

async function findRefreshToken(
  userId: string,
  refreshTokenId: string,
): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId,
  }
}

async function notCalledFindRefreshToken(): Promise<
  DbRefreshToken | undefined
> {
  throw new Error('must not be called')
}

async function dontFindRefresToken(): Promise<undefined> {
  return undefined
}

async function lockUserById(userId: string): Promise<User> {
  return buildUser({ id: userId })
}

async function notCalledLockUserById(): Promise<User | undefined> {
  throw new Error('must not be called')
}

async function createAuthTokenPayload(user: User): Promise<AuthTokenPayload> {
  return {
    userId: user.id,
    role: user.role,
    refreshTokenId,
  }
}

suite('authorization service unit tests', () => {
  test('authorize admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authorizationService.authorizeAdmin(payload)
  })

  test('fail to authorize admin as viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    expectThrow(() => {
      authorizationService.authorizeAdmin(payload)
    }, noRightsError)
  })

  test('authorize viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    authorizationService.authorizeViewer(payload)
  })

  test('authorize viewer as admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authorizationService.authorizeViewer(payload)
  })

  test('fail to authorize user without user id', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await expectReject(async () => {
      await authorizationService.authorizeUser(
        '',
        authTokenPayload,
        notCalledFindRefreshToken,
      )
    }, noUserIdParameterError)
  })

  test('authorize self user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      admin.id,
      authTokenPayload,
      notCalledFindRefreshToken,
    )
  })

  test('authorize other admin user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      otherAdmin.id,
      authTokenPayload,
      notCalledFindRefreshToken,
    )
  })

  test('authorize viewer user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUser(
      viewer.id,
      authTokenPayload,
      notCalledFindRefreshToken,
    )
  })

  test('authorize self user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await authorizationService.authorizeUser(
      viewer.id,
      authTokenPayload,
      findRefreshToken,
    )
  })

  test('fail to authorize admin user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUser(
        admin.id,
        authTokenPayload,
        notCalledFindRefreshToken,
      )
    }, userMismatchError)
  })

  test('fail to authorize other viewer user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUser(
        otherViewer.id,
        authTokenPayload,
        notCalledFindRefreshToken,
      )
    }, userMismatchError)
  })

  test('fail to authorize viewer when refresh token not found', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUser(
        viewer.id,
        authTokenPayload,
        dontFindRefresToken,
      )
    }, userOrRefreshTokenNotFoundError)
  })

  test('lock the viewer before finding its refresh token', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    const calls: string[] = []
    await authorizationService.authorizeUserForUpdate(
      viewer.id,
      authTokenPayload,
      async (userId: string): Promise<User> => {
        calls.push(`lock user ${userId}`)
        return viewer
      },
      async (userId: string, id: string): Promise<DbRefreshToken> => {
        calls.push(`find refresh token ${id}`)
        return { id, userId }
      },
    )
    assertDeepEqual(calls, [
      `lock user ${viewer.id}`,
      `find refresh token ${refreshTokenId}`,
    ])
  })

  test('authorize viewer user for update as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authorizationService.authorizeUserForUpdate(
      viewer.id,
      authTokenPayload,
      notCalledLockUserById,
      notCalledFindRefreshToken,
    )
  })

  test('fail to authorize user for update without user id', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUserForUpdate(
        '',
        authTokenPayload,
        notCalledLockUserById,
        notCalledFindRefreshToken,
      )
    }, noUserIdParameterError)
  })

  test('fail to authorize other viewer user for update as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUserForUpdate(
        otherViewer.id,
        authTokenPayload,
        notCalledLockUserById,
        notCalledFindRefreshToken,
      )
    }, userMismatchError)
  })

  test('fail to authorize viewer for update when user not found', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUserForUpdate(
        viewer.id,
        authTokenPayload,
        async () => undefined,
        notCalledFindRefreshToken,
      )
    }, userOrRefreshTokenNotFoundError)
  })

  test('fail to authorize viewer for update when refresh token not found', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    await expectReject(async () => {
      await authorizationService.authorizeUserForUpdate(
        viewer.id,
        authTokenPayload,
        lockUserById,
        dontFindRefresToken,
      )
    }, userOrRefreshTokenNotFoundError)
  })
})
