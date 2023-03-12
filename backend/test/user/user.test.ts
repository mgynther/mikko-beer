import { expect } from 'chai'

import { TestContext } from '../test-context'
import { User } from '../../src/user/user'
import { AxiosResponse } from 'axios'

describe('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('should fail to create a user without authorization', async () => {
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
    expect(noAuthRes.status).to.equal(400)

    const invalidAuthRes = await ctx.request.post(`/api/v1/user`, params, ctx.createAuthHeaders('invalid token'))
    expect(invalidAuthRes.status).to.equal(401)
  })

  it('should create a user', async () => {
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

    expect(res.status).to.equal(201)
    expect(res.data.user.username).to.equal('Anon')
    expect(res.data.user.role).to.equal('admin')

    // The returned auth token should be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(res.data.authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.user).to.eql(res.data.user)
  })

  it('should get user by id', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)
    expect(res.data).to.eql({ user })
  })

  it('should sign in a user', async () => {
    const { user, authToken, username, password } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: password,
    })

    expect(res.status).to.equal(200)

    // The returned auth token should be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(200)
    expect(getRes.data.user).to.eql(res.data.user)
  })

  it('should fail to sign in user with the wrong password', async () => {
    const { user, authToken, username } = await ctx.createUser()

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: 'wrong password',
    })

    expect(res.status).to.equal(401)
    expect(res.data).to.eql({
      error: {
        code: 'InvalidCredentials',
        message: 'wrong username or password',
      },
    })

    // Only the one refresh token created for the anonymous user should exists.
    expect(
      await ctx.db.getDb()
        .selectFrom('refresh_token')
        .select('refresh_token.user_id')
        .execute()
    ).to.have.length(1)
  })

  it('should sign out a user', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
      ctx.createAuthHeaders(authToken)
    )

    expect(res.status).to.equal(200)

    // The auth token should no longer be usable.
    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken)
    )

    expect(getRes.status).to.equal(404)
    expect(getRes.data.error.code).to.equal('UserOrRefreshTokenNotFound')
  })

})
