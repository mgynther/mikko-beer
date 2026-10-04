import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { assertLockHoldsOffWrite } from '../lock.js'
import { TestContext } from '../test-context.js'
import type { Transaction } from '../../../src/data/database.js'
import * as refreshTokenRepository from '../../../src/data/authentication/refresh-token.repository.js'
import type { DbRefreshToken } from '../../../src/data/authentication/refresh-token.repository.js'
import * as userRepository from '../../../src/data/user/user.repository.js'
import { assertDeepEqual, assertEqual, assertRejects } from '../../assert.js'

suite('refresh token tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function insertRefreshToken(
    username = 'user',
  ): Promise<DbRefreshToken> {
    return await ctx.db.executeReadWriteTransaction(async (trx) => {
      const user = await userRepository.insertUser(trx, {
        username,
        role: 'viewer',
      })
      return await refreshTokenRepository.insertRefreshToken(
        trx,
        user.id,
        new Date(),
      )
    })
  }

  test('find refresh token', async () => {
    const refreshToken = await insertRefreshToken()
    const foundToken = await refreshTokenRepository.findRefreshToken(
      ctx.db,
      refreshToken.userId,
      refreshToken.id,
    )
    assertDeepEqual(foundToken, refreshToken)
  })

  test('find no refresh token of another user', async () => {
    const refreshToken = await insertRefreshToken('alice')
    const otherToken = await insertRefreshToken('bob')
    const foundToken = await refreshTokenRepository.findRefreshToken(
      ctx.db,
      otherToken.userId,
      refreshToken.id,
    )
    assertEqual(foundToken, undefined)
  })

  test('find refresh token in transaction', async () => {
    const refreshToken = await insertRefreshToken()
    const foundToken = await ctx.db.executeReadWriteTransaction(
      async (trx) =>
        await refreshTokenRepository.findRefreshTokenInTransaction(
          trx,
          refreshToken.userId,
          refreshToken.id,
        ),
    )
    assertDeepEqual(foundToken, refreshToken)
  })

  test('find no refresh token of another user in transaction', async () => {
    const refreshToken = await insertRefreshToken('alice')
    const otherToken = await insertRefreshToken('bob')
    const foundToken = await ctx.db.executeReadWriteTransaction(
      async (trx) =>
        await refreshTokenRepository.findRefreshTokenInTransaction(
          trx,
          otherToken.userId,
          refreshToken.id,
        ),
    )
    assertEqual(foundToken, undefined)
  })

  test('find no refresh token deleted earlier in the transaction', async () => {
    const refreshToken = await insertRefreshToken()
    const foundToken = await ctx.db.executeReadWriteTransaction(async (trx) => {
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id)
      return await refreshTokenRepository.findRefreshTokenInTransaction(
        trx,
        refreshToken.userId,
        refreshToken.id,
      )
    })
    assertEqual(foundToken, undefined)
  })

  test('keep a refresh token found in transaction from being deleted until the transaction ends', async () => {
    const refreshToken = await insertRefreshToken()
    await assertLockHoldsOffWrite(
      ctx.db,
      async (trx: Transaction) =>
        await refreshTokenRepository.findRefreshTokenInTransaction(
          trx,
          refreshToken.userId,
          refreshToken.id,
        ),
      async (trx: Transaction) =>
        await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
    )
  })

  test('delete refresh token', async () => {
    const refreshToken = await insertRefreshToken()
    const wasDeleted = await ctx.db.executeReadWriteTransaction(
      async (trx) =>
        await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
    )
    assertEqual(wasDeleted, true)
    const foundToken = await refreshTokenRepository.findRefreshToken(
      ctx.db,
      refreshToken.userId,
      refreshToken.id,
    )
    assertEqual(foundToken, undefined)
  })

  test('delete only the given refresh token', async () => {
    const refreshToken = await insertRefreshToken('alice')
    const otherToken = await insertRefreshToken('bob')
    await ctx.db.executeReadWriteTransaction(
      async (trx) =>
        await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
    )
    const foundToken = await refreshTokenRepository.findRefreshToken(
      ctx.db,
      otherToken.userId,
      otherToken.id,
    )
    assertDeepEqual(foundToken, otherToken)
  })

  test('report no deletion for a refresh token already deleted', async () => {
    const refreshToken = await insertRefreshToken()
    const deletions = await ctx.db.executeReadWriteTransaction(async (trx) => [
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
    ])
    assertDeepEqual(deletions, [true, false])
  })

  test('delete the refresh tokens with their user', async () => {
    const refreshToken = await insertRefreshToken()
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      await userRepository.deleteUserById(trx, refreshToken.userId)
    })
    // Read from the table, since finding a token joins its user and would
    // find nothing even if the row were left behind.
    const rows = await ctx.db
      .getDb()
      .selectFrom('refresh_token')
      .select('refresh_token_id')
      .execute()
    assertDeepEqual(rows, [])
  })

  test('keep refresh token when the deleting transaction fails', async () => {
    const refreshToken = await insertRefreshToken()
    const error = new Error('creating new tokens failed')
    await assertRejects(
      async () => {
        await ctx.db.executeReadWriteTransaction(async (trx) => {
          await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id)
          throw error
        })
      },
      error,
      Error,
    )
    const foundToken = await refreshTokenRepository.findRefreshToken(
      ctx.db,
      refreshToken.userId,
      refreshToken.id,
    )
    assertDeepEqual(foundToken, refreshToken)
  })
})
