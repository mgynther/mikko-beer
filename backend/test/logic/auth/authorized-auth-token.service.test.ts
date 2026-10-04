import { suite, test } from '../../test.js'

import * as authTokenService from '../../../src/logic/auth/authorized-auth-token.service.js'

import { expectReject } from '../controller-error-helper.js'
import type { DeleteRefreshTokenIf } from '../../../src/logic/auth/authorized-auth-token.service.js'
import type { RefreshTokenPayload } from '../../../src/logic/auth/refresh-token.js'
import {
  invalidCredentialsError,
  invalidCredentialsTokenError,
  invalidUserIdError,
} from '../../../src/logic/errors.js'
import type { User, ValidateUserId } from '../../../src/logic/user/user.js'
import { mockFunction } from '../../mock.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { buildUser } from '../user/builders.js'

const validateUserId: ValidateUserId = (id: string | undefined) => ({
  errorCode: undefined,
  result: id ?? '',
})

const userId = '8460921e-08b1-4ab5-83d2-7fdde2b106fb'
const refreshTokenId = '8c011ef7-13ac-4dae-b9cf-81c41ed7ed96'

const refreshTokenPayload: RefreshTokenPayload = {
  userId,
  refreshTokenId,
  isRefreshToken: true,
}

const deleteRefreshTokenIf: DeleteRefreshTokenIf = {
  lockUserById: async (id: string): Promise<User> => buildUser({ id }),
  deleteRefreshToken: async (): Promise<boolean> => true,
}

suite('authorized auth token service unit tests', () => {
  test('delete the refresh token of the payload', async () => {
    const deleteToken = mockFunction<
      [refreshTokenId: string],
      Promise<boolean>
    >(async () => true)
    await authTokenService.deleteRefreshToken(
      { ...deleteRefreshTokenIf, deleteRefreshToken: deleteToken },
      validateUserId,
      userId,
      refreshTokenPayload,
    )
    assertDeepEqual(
      deleteToken.mock.calls.map((call) => call.arguments),
      [[refreshTokenId]],
    )
  })

  test('fail to delete a refresh token already deleted', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        { ...deleteRefreshTokenIf, deleteRefreshToken: async () => false },
        validateUserId,
        userId,
        refreshTokenPayload,
      )
    }, invalidCredentialsTokenError)
  })

  test('fail to delete a refresh token of another user than the path', async () => {
    const deleteToken = mockFunction<
      [refreshTokenId: string],
      Promise<boolean>
    >(async () => true)
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        { ...deleteRefreshTokenIf, deleteRefreshToken: deleteToken },
        validateUserId,
        '75c72a6f-95a0-475d-9b50-e926fe59ebc4',
        refreshTokenPayload,
      )
    }, invalidCredentialsTokenError)
    assertEqual(deleteToken.mock.callCount(), 0)
  })

  test('fail to delete a refresh token with an invalid path id', async () => {
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        deleteRefreshTokenIf,
        () => ({ errorCode: 'invalid-user-id', result: undefined }),
        userId,
        refreshTokenPayload,
      )
    }, invalidUserIdError)
  })

  test('fail to delete a refresh token of a user that no longer exists', async () => {
    const deleteToken = mockFunction<
      [refreshTokenId: string],
      Promise<boolean>
    >(async () => true)
    await expectReject(async () => {
      await authTokenService.deleteRefreshToken(
        {
          lockUserById: async () => undefined,
          deleteRefreshToken: deleteToken,
        },
        validateUserId,
        userId,
        refreshTokenPayload,
      )
    }, invalidCredentialsError)
    assertEqual(deleteToken.mock.callCount(), 0)
  })

  // User deletion removes the tokens through a cascade after the user row,
  // so deleting a token before locking its user could deadlock against it.
  test('lock the user of the payload before deleting the token', async () => {
    const calls: string[] = []
    await authTokenService.deleteRefreshToken(
      {
        lockUserById: async (id: string): Promise<User> => {
          calls.push(`lock user ${id}`)
          return buildUser({ id })
        },
        deleteRefreshToken: async (id: string): Promise<boolean> => {
          calls.push(`delete refresh token ${id}`)
          return true
        },
      },
      validateUserId,
      userId,
      refreshTokenPayload,
    )
    assertDeepEqual(calls, [
      `lock user ${userId}`,
      `delete refresh token ${refreshTokenId}`,
    ])
  })
})
