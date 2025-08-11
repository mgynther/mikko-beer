import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import { User } from '../../../src/core/user/user'
import { assertDeepEqual, assertEqual, assertNotDeepEqual } from '../../assert'

describe('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('fail to create a user without authorization', async () => {
    const params = {
      user: {
        role: 'admin',
      },
      passwordSignInMethod: {
        username: 'Anon',
        password: 'does not matter'
      }
    }
    const noAuthRes = await ctx.request.post(`/api/v1/user`, params)
    assertEqual(noAuthRes.status, 400)

    const invalidAuthRes = await ctx.request.post(`/api/v1/user`, params, ctx.createAuthHeaders('invalid token'))
    assertEqual(invalidAuthRes.status, 401)
  })

  it('create a user', async () => {
    const res = await ctx.request.post(`/api/v1/user`, {
      user: {
        role: 'admin',
      },
      passwordSignInMethod: {
        username: 'Anon',
        password: 'does not matter'
      }
    },
      ctx.adminAuthHeaders()
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.user.username, 'Anon')
    assertEqual(res.data.user.role, 'admin')

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(res.data.authToken)
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, res.data.user)
  })

  it('get user by id', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { user })
  })

  it('sign in a user', async () => {
    const { authToken, username, password } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: password,
    })

    assertEqual(res.status, 200)

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, res.data.user)
  })

  it('fail to sign in user with the wrong password', async () => {
    const { username } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: 'wrong password',
    })

    assertEqual(res.status, 401)
    assertDeepEqual(res.data, {
      error: {
        code: 'InvalidCredentials',
        message: 'wrong username or password',
      },
    })

    // Only the one refresh token created for the anonymous user exists.
    const results = await ctx.db.getDb()
      .selectFrom('refresh_token')
      .select('refresh_token.user_id')
      .execute()
    assertEqual(results.length, 1)
  })

  it('sign out a user', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(res.status, 200)

    // The auth token is no longer be usable.
    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(getRes.status, 404)
    assertEqual(getRes.data.error.code, 'UserOrRefreshTokenNotFound')
  })

  it('refresh auth token', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken }
    )

    assertEqual(res.status, 200)
    assertNotDeepEqual(res.data.authToken, authToken)
    assertNotDeepEqual(res.data.refreshToken, refreshToken)

    // The old auth token is no longer be usable.
    const failGetRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(failGetRes.status, 404)
    assertEqual(failGetRes.data.error.code, 'UserOrRefreshTokenNotFound')

    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(res.data.authToken)
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.user.username, user.username)
  })

  it('do not change tokens on invalid refresh request', async () => {
    const { user, authToken } = await ctx.createUser()
    const anotherUser = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken: anotherUser.refreshToken }
    )
    assertEqual(res.status, 401)

    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )
    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.user.username, user.username)
  })

  it('change password', async () => {
    const { user, authToken, username, password } = await ctx.createUser()

    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, user)

    const newPassword = 'a different password'
    const wrongPwdChangeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: 'a wrong password',
        newPassword
      }, ctx.createAuthHeaders(authToken)
    )
    assertEqual(wrongPwdChangeRes.status, 401)

    const changeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: password,
        newPassword
      }, ctx.createAuthHeaders(authToken)
    )
    assertEqual(changeRes.status, 204)

    const oldPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`, {
        username: username,
        password: password,
      },
      ctx.createAuthHeaders(authToken)
    )
    assertEqual(oldPwdSignInRes.status, 401)

    const currentPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`, {
        username: username,
        password: newPassword,
      }, ctx.createAuthHeaders(authToken)
    )
    assertEqual(currentPwdSignInRes.status, 200)
  })

  it('delete user', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )
    assertEqual(res.status, 200)

    const deleteRes = await ctx.request.delete(
      `/api/v1/user/${res.data.user.id}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(deleteRes.status, 204)

    const afterDeleteGetRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(afterDeleteGetRes.status, 404)
  })

})
