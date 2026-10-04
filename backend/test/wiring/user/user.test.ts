import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import { assertDeepEqual, assertEqual, assertNotEqual } from '../../assert.js'
import type {
  CreatedUserBody,
  ReadUserBody,
  UserListBody,
} from '../../../src/web/user/user.js'
import type {
  SignInBody,
  SignOutBody,
  TokensBody,
} from '../../../src/web/user/sign-in-method.js'

import {
  findPasswordSignInMethod,
  updatePassword,
} from '../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import type { Database } from '../../../src/data/database.js'
import { jwtIf } from '../../../src/wiring/authentication/jwt-helper.js'
import { testConfig } from '../test-config.js'
import type { RequestHeaders } from '../../client.js'

async function findPasswordHash(
  db: Database,
  userId: string,
): Promise<string | undefined> {
  const signInMethod = await db.executeReadWriteTransaction(
    async (trx) => await findPasswordSignInMethod(trx, userId),
  )
  return signInMethod?.passwordHash
}

// The tokens a request answers with are signed and verified with the
// configured secret and checked against the database, so the wiring tests
// show them working by using them.
suite('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function findUser(
    userId: string,
    authToken: string,
  ): Promise<{ status: number; data: ReadUserBody }> {
    return await ctx.request.get<ReadUserBody>(
      `/api/v1/user/${userId}`,
      ctx.createAuthHeaders(authToken),
    )
  }

  test('create a user with tokens that work', async () => {
    const res = await ctx.request.post<CreatedUserBody>(
      `/api/v1/user`,
      {
        user: { role: 'viewer' },
        passwordSignInMethod: {
          username: 'kalle',
          password: 'kalja ja makkara',
        },
      },
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 201)
    const { user, authToken } = res.data
    assertDeepEqual(user, { id: user.id, role: 'viewer', username: 'kalle' })
    const getRes = await findUser(user.id, authToken)
    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data, { user })
  })

  test('find a user', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await findUser(user.id, authToken)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { user })
  })

  test('list users', async () => {
    const { user, authToken } = await ctx.createUser()

    const res = await ctx.request.get<UserListBody>(
      `/api/v1/user`,
      ctx.createAuthHeaders(authToken),
    )

    assertEqual(res.status, 200)
    // The initial admin has no username, so it comes after every user that
    // has one.
    assertDeepEqual(res.data, {
      users: [user, { id: ctx.adminUserId(), role: 'admin', username: null }],
    })
  })

  test('delete a user', async () => {
    const { user } = await ctx.createUser()

    const res = await ctx.request.delete(
      `/api/v1/user/${user.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(res.status, 204)

    const getRes = await ctx.request.get(
      `/api/v1/user/${user.id}`,
      ctx.adminAuthHeaders(),
    )
    assertEqual(getRes.status, 404)
  })

  test('sign in a user with tokens that work', async () => {
    const { user, username, password } = await ctx.createUser()

    const res = await ctx.request.post<SignInBody>(`/api/v1/user/sign-in`, {
      username,
      password,
    })

    assertEqual(res.status, 200)
    assertDeepEqual(res.data.user, user)
    assertEqual((await findUser(user.id, res.data.authToken)).status, 200)
  })

  // The application's own hash parameters decide what is rehashed.
  test('rehash password hashed with other parameters on sign in', async () => {
    const { user, username } = await ctx.createUser()
    const otherParametersHash =
      '$scrypt$ln=14,r=8,p=1$LSFeH5c5d4Fav49HIqHpiQ$7biLfcxLU9RUv+TVf2fM3s7wY4DJiOfzavESywH5/iFFItGPC9zylXDHCouIE3eJpRbFepfVanqB+inf92yIdA'
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      return await updatePassword(trx, {
        userId: user.id,
        passwordHash: otherParametersHash,
      })
    })

    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username,
      password: 'password',
    })
    assertEqual(res.status, 200)

    const passwordHash = await findPasswordHash(ctx.db, user.id)
    assertEqual(passwordHash?.startsWith('$scrypt$ln=10,r=8,p=1$'), true)
  })

  // Runs the configured hash of a password that has nothing to be checked
  // against, which the logic tests replace and the response cannot show.
  test('fail to sign in an unknown user like a wrong password', async () => {
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

  async function signOut(
    userId: string,
    refreshToken: string,
    headers: RequestHeaders = {},
  ): Promise<{ status: number; data: SignOutBody }> {
    return await ctx.request.post<SignOutBody>(
      `/api/v1/user/${userId}/sign-out`,
      { refreshToken },
      headers,
    )
  }

  async function refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ status: number; data: TokensBody }> {
    return await ctx.request.post<TokensBody>(
      `/api/v1/user/${userId}/refresh`,
      { refreshToken },
    )
  }

  test('sign out a user and its auth token with it', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await signOut(user.id, refreshToken)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { success: true })
    const getRes = await findUser(user.id, authToken)
    assertEqual(getRes.status, 404)
    assertEqual((await refresh(user.id, refreshToken)).status, 401)
  })

  // The client may still send the auth token it holds, and by the time it
  // signs out the token may have expired.
  test('sign out whatever the auth token sent with it', async () => {
    const { user, refreshToken } = await ctx.createUser()
    const expiredAuthToken = jwtIf.sign(
      {
        userId: user.id,
        role: user.role,
        refreshTokenId: '5c1f0b7e-2d4a-4e9b-8f3c-6a7d1e2b9c04',
      },
      testConfig.authTokenSecret,
      -1,
    )

    const res = await signOut(
      user.id,
      refreshToken,
      ctx.createAuthHeaders(expiredAuthToken),
    )

    assertEqual(res.status, 200)
    assertEqual((await refresh(user.id, refreshToken)).status, 401)
  })

  // A sign-out sent with a refresh token that a refresh has meanwhile
  // replaced leaves the replacement to be signed out with.
  test('sign out with a refresh token retired by refreshing', async () => {
    const { user, refreshToken } = await ctx.createUser()
    const refreshed = await refresh(user.id, refreshToken)

    const retiredRes = await ctx.request.post(
      `/api/v1/user/${user.id}/sign-out`,
      { refreshToken },
    )
    const currentRes = await signOut(user.id, refreshed.data.refreshToken)

    assertEqual(retiredRes.status, 401)
    assertDeepEqual(retiredRes.data, {
      error: { code: 'InvalidCredentials', message: 'invalid token' },
    })
    assertEqual(currentRes.status, 200)
    assertEqual(
      (await refresh(user.id, refreshed.data.refreshToken)).status,
      401,
    )
  })

  test('refresh tokens and retire the old ones', async () => {
    const { user, authToken, refreshToken } = await ctx.createUser()

    const res = await ctx.request.post<TokensBody>(
      `/api/v1/user/${user.id}/refresh`,
      { refreshToken },
    )

    assertEqual(res.status, 200)
    assertNotEqual(res.data.refreshToken, refreshToken)
    assertEqual((await findUser(user.id, authToken)).status, 404)
    assertEqual((await findUser(user.id, res.data.authToken)).status, 200)
  })

  test('change password to sign in with the new one only', async () => {
    const { user, authToken, username, password } = await ctx.createUser()
    const newPassword = 'a different password'

    const res = await ctx.request.post(
      `/api/v1/user/${user.id}/change-password`,
      { oldPassword: password, newPassword },
      ctx.createAuthHeaders(authToken),
    )
    assertEqual(res.status, 204)

    const [oldPasswordRes, newPasswordRes] = await Promise.all(
      [password, newPassword].map((attempt) =>
        ctx.request.post(`/api/v1/user/sign-in`, {
          username,
          password: attempt,
        }),
      ),
    )
    assertEqual(oldPasswordRes.status, 401)
    assertEqual(newPasswordRes.status, 200)
  })
})
