import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import {
  assertDeepEqual,
  assertEqual,
  assertNotDeepEqual,
} from '../../assert.js'
import type { CreatedUser, ReadUser } from '../../../src/web/user/user.js'
import type { SignInResponseUser } from '../../../src/web/user/sign-in-method.js'

import {
  findPasswordSignInMethod,
  updatePassword,
} from '../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import type { UserPasswordHash } from '../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import type { Database } from '../../../src/data/database.js'

async function getSignInMethod(
  db: Database,
  userId: string,
): Promise<UserPasswordHash> {
  const signInMethod = await db.executeReadWriteTransaction(async (trx) => {
    return await findPasswordSignInMethod(trx, userId)
  })
  if (signInMethod === undefined) {
    throw new Error('unexpected undefined signInMethod')
  }
  return signInMethod
}

suite('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('fail to create a user without authorization', async () => {
    const params = {
      user: {
        role: 'admin',
      },
      passwordSignInMethod: {
        username: 'Anon',
        password: 'does not matter',
      },
    }
    const noAuthRes = await ctx.request.post(`/api/v1/user`, params)
    assertEqual(noAuthRes.status, 400)

    const invalidAuthRes = await ctx.request.post(
      `/api/v1/user`,
      params,
      ctx.createAuthHeaders('invalid token'),
    )
    assertEqual(invalidAuthRes.status, 401)
  })

  test('create a user', async () => {
    const res = await ctx.request.post<{
      user: CreatedUser
      authToken: string
      refreshToken: string
    }>(
      `/api/v1/user`,
      {
        user: {
          role: 'admin',
        },
        passwordSignInMethod: {
          username: 'Anon',
          password: 'does not matter',
        },
      },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    assertEqual(res.data.user.username, 'Anon')
    assertEqual(res.data.user.role, 'admin')

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(res.data.authToken),
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, res.data.user)
  })

  test('get user by id', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { user })
  })

  test('list users', async () => {
    const { user, authToken } = await ctx.createUser()

    interface Response {
      users: ReadUser[]
    }
    const res = await ctx.request.get<Response>(
      `/api/v1/user`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(res.status, 200)
    // The initial admin has no username, so it comes after every user that has.
    const expectedResponse: Response = {
      users: [
        user,
        {
          id: ctx.adminUserId(),
          role: 'admin',
          username: null,
        },
      ],
    }
    assertDeepEqual(res.data, expectedResponse)
  })

  test('sign in a user', async () => {
    const { authToken, user, username, password } = await ctx.createUser()

    const originalSignInMethod = await getSignInMethod(ctx.db, user.id)

    const res = await ctx.request.post<{
      user: SignInResponseUser
      authToken: string
      refreshToken: string
    }>(`/api/v1/user/sign-in`, {
      username: username,
      password: password,
    })

    assertEqual(res.status, 200)

    const postLoginSignInMethod = await getSignInMethod(ctx.db, user.id)
    assertDeepEqual(postLoginSignInMethod, originalSignInMethod)

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${res.data.user.id}`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, res.data.user)
  })

  test('rehash password hashed with other parameters on sign in', async () => {
    const { user, username } = await ctx.createUser()
    const password = 'password'
    const otherParametersHash =
      '$scrypt$ln=14,r=8,p=1$LSFeH5c5d4Fav49HIqHpiQ$7biLfcxLU9RUv+TVf2fM3s7wY4DJiOfzavESywH5/iFFItGPC9zylXDHCouIE3eJpRbFepfVanqB+inf92yIdA'
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      return await updatePassword(trx, {
        userId: user.id,
        passwordHash: otherParametersHash,
      })
    })

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: username,
      password: password,
    })
    assertEqual(res.status, 200)

    const postLoginSignInMethod = await getSignInMethod(ctx.db, user.id)
    assertEqual(
      postLoginSignInMethod.passwordHash.startsWith('$scrypt$ln=10,r=8,p=1$'),
      true,
    )
  })

  test('fail to sign in user with the wrong password', async () => {
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
    const results = await ctx.db
      .getDb()
      .selectFrom('refresh_token')
      .select('refresh_token.user_id')
      .execute()
    assertEqual(results.length, 1)
  })

  test('fail to sign in unknown user like a wrong password', async () => {
    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: 'unknown',
      password: 'password',
    })

    assertEqual(res.status, 401)
    assertDeepEqual(res.data, {
      error: {
        code: 'InvalidCredentials',
        message: 'wrong username or password',
      },
    })
  })

  test('sign out a user', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(res.status, 200)

    // The auth token is no longer be usable.
    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(getRes.status, 404)
    assertEqual(getRes.data.error.code, 'UserOrRefreshTokenNotFound')
  })

  test('refresh auth token', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post<{
      authToken: string
      refreshToken: string
    }>(`/api/v1/user/${user.id}/refresh`, {
      refreshToken,
    })

    assertEqual(res.status, 200)
    assertNotDeepEqual(res.data.authToken, authToken)
    assertNotDeepEqual(res.data.refreshToken, refreshToken)

    // The old auth token is no longer be usable.
    const failGetRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(failGetRes.status, 404)
    assertEqual(failGetRes.data.error.code, 'UserOrRefreshTokenNotFound')

    const getRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(res.data.authToken),
    )

    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.user.username, user.username)
  })

  test('fail to refresh with a refresh token already used', async () => {
    const { user, refreshToken } = await ctx.createUser()
    const firstRes = await ctx.request.post(`/api/v1/user/${user.id}/refresh`, {
      refreshToken,
    })
    assertEqual(firstRes.status, 200)

    const secondRes = await ctx.request.post(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken },
    )
    assertEqual(secondRes.status, 401)
    assertEqual(secondRes.data.error.code, 'InvalidCredentials')
  })

  test('fail to refresh with a signed out refresh token', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()
    const signOutRes = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(signOutRes.status, 200)

    const res = await ctx.request.post(`/api/v1/user/${user.id}/refresh`, {
      refreshToken,
    })
    assertEqual(res.status, 401)
    assertEqual(res.data.error.code, 'InvalidCredentials')
  })

  test('do not change tokens on invalid refresh request', async () => {
    const [{ user, authToken }, anotherUser] = await Promise.all([
      ctx.createUser(),
      ctx.createUser(),
    ])

    const res = await ctx.request.post(`/api/v1/user/${user.id}/refresh`, {
      refreshToken: anotherUser.refreshToken,
    })
    assertEqual(res.status, 401)

    const getRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(getRes.status, 200)
    assertEqual(getRes.data.user.username, user.username)
  })

  test('change password', async () => {
    const { user, authToken, username, password } = await ctx.createUser()

    const getRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, user)

    const newPassword = 'a different password'
    const wrongPwdChangeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: 'a wrong password',
        newPassword,
      },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(wrongPwdChangeRes.status, 401)

    const changeRes = await ctx.request.post(
      `/api/v1/user/${getRes.data.user.id}/change-password`,
      {
        oldPassword: password,
        newPassword,
      },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(changeRes.status, 204)

    const oldPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`,
      {
        username: username,
        password: password,
      },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(oldPwdSignInRes.status, 401)

    const currentPwdSignInRes = await ctx.request.post(
      `/api/v1/user/sign-in`,
      {
        username: username,
        password: newPassword,
      },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(currentPwdSignInRes.status, 200)
  })

  test('delete user', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(res.status, 200)

    const deleteRes = await ctx.request.delete(
      `/api/v1/user/${res.data.user.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(deleteRes.status, 204)

    const afterDeleteGetRes = await ctx.request.get<{ user: ReadUser }>(
      `/api/v1/user/${user.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(afterDeleteGetRes.status, 404)
  })
})
