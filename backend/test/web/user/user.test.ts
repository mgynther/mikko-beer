import { expect } from 'earl'

import { TestContext } from '../test-context'
import { User } from '../../../src/core/user/user'

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
    expect(noAuthRes.status).toEqual(400)

    const invalidAuthRes = await ctx.request.post(`/api/v1/user`, params, ctx.createAuthHeaders('invalid token'))
    expect(invalidAuthRes.status).toEqual(401)
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

    expect(res.status).toEqual(201)
    expect(res.data.user.username).toEqual('Anon')
    expect(res.data.user.role).toEqual('admin')

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(res.data.authToken)
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.user).toEqual(res.data.user)
  })

  it('get user by id', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).toEqual(200)
    expect(res.data).toEqual({ user })
  })

  it('sign in a user', async () => {
    const { authToken, username, password } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: password,
    })

    expect(res.status).toEqual(200)

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.user).toEqual(res.data.user)
  })

  it('fail to sign in user with the wrong password', async () => {
    const { username } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: 'wrong password',
    })

    expect(res.status).toEqual(401)
    expect(res.data).toEqual({
      error: {
        code: 'InvalidCredentials',
        message: 'wrong username or password',
      },
    })

    // Only the one refresh token created for the anonymous user exists.
    expect(
      await ctx.db.getDb()
        .selectFrom('refresh_token')
        .select('refresh_token.user_id')
        .execute()
    ).toHaveLength(1)
  })

  it('sign out a user', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).toEqual(200)

    // The auth token is no longer be usable.
    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).toEqual(404)
    expect(getRes.data.error.code).toEqual('UserOrRefreshTokenNotFound')
  })

  it('refresh auth token', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken }
    )

    expect(res.status).toEqual(200)
    expect(res.data.authToken).not.toEqual(authToken)
    expect(res.data.refreshToken).not.toEqual(refreshToken)

    // The old auth token is no longer be usable.
    const failGetRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(failGetRes.status).toEqual(404)
    expect(failGetRes.data.error.code).toEqual('UserOrRefreshTokenNotFound')

    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(res.data.authToken)
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.user.username).toEqual(user.username)
  })

  it('do not change tokens on invalid refresh request', async () => {
    const { user, authToken } = await ctx.createUser()
    const anotherUser = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken: anotherUser.refreshToken }
    )
    expect(res.status).toEqual(401)

    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )
    expect(getRes.status).toEqual(200)
    expect(getRes.data.user.username).toEqual(user.username)
  })

  it('change password', async () => {
    const { user, authToken, username, password } = await ctx.createUser()

    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).toEqual(200)
    expect(getRes.data.user).toEqual(user)

    const newPassword = 'a different password'
    const wrongPwdChangeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: 'a wrong password',
        newPassword
      }, ctx.createAuthHeaders(authToken)
    )
    expect(wrongPwdChangeRes.status).toEqual(401)

    const changeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: password,
        newPassword
      }, ctx.createAuthHeaders(authToken)
    )
    expect(changeRes.status).toEqual(204)

    const oldPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`, {
        username: username,
        password: password,
      },
      ctx.createAuthHeaders(authToken)
    )
    expect(oldPwdSignInRes.status).toEqual(401)

    const currentPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`, {
        username: username,
        password: newPassword,
      }, ctx.createAuthHeaders(authToken)
    )
    expect(currentPwdSignInRes.status).toEqual(200)
  })

  it('delete user', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )
    expect(res.status).toEqual(200)

    const deleteRes = await ctx.request.delete(
      `/api/v1/user/${res.data.user.id}`,
      ctx.adminAuthHeaders()
    )
    expect(deleteRes.status).toEqual(204)

    const afterDeleteGetRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.adminAuthHeaders()
    )
    expect(afterDeleteGetRes.status).toEqual(404)
  })

})
