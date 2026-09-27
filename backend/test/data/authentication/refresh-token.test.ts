import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
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

  async function insertRefreshToken(): Promise<DbRefreshToken> {
    return await ctx.db.executeReadWriteTransaction(async (trx) => {
      const user = await userRepository.insertUser(trx, {
        username: 'user',
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

  // Without the lock the delete finishes well within the wait, and the
  // events come out in the other order.
  test('keep a refresh token found in transaction from being deleted until the transaction ends', async () => {
    const refreshToken = await insertRefreshToken()
    const events: string[] = []
    let found: () => void = () => undefined
    const wasFound = new Promise<void>((resolve) => {
      found = resolve
    })

    const finding = ctx.db.executeReadWriteTransaction(async (trx) => {
      await refreshTokenRepository.findRefreshTokenInTransaction(
        trx,
        refreshToken.userId,
        refreshToken.id,
      )
      found()
      await new Promise((resolve) => setTimeout(resolve, 100))
      events.push('finding transaction ended')
    })
    await wasFound
    const deleting = ctx.db.executeReadWriteTransaction(async (trx) => {
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id)
      events.push('deleted')
    })
    await Promise.all([finding, deleting])

    assertDeepEqual(events, ['finding transaction ended', 'deleted'])
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

  test('report no deletion for a refresh token already deleted', async () => {
    const refreshToken = await insertRefreshToken()
    const deletions = await ctx.db.executeReadWriteTransaction(async (trx) => [
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
      await refreshTokenRepository.deleteRefreshToken(trx, refreshToken.id),
    ])
    assertDeepEqual(deletions, [true, false])
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
