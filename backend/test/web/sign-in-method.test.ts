import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  RefreshRequest,
  SignInBody,
  SignInRequest,
  SignOutBody,
  TokensBody,
} from '../../src/web/user/sign-in-method.js'
import type { IdBodyRequest } from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const userId = 'a4b2c9d1-7e3f-4a5b-9c8d-0e1f2a3b4c5d'

const tokensBody: TokensBody = {
  authToken: 'new auth token',
  refreshToken: 'new refresh token',
}

suite('sign-in method routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('sign in without an authorization', async () => {
    const signInBody: SignInBody = {
      user: { id: userId, role: 'viewer', username: 'drinker' },
      ...tokensBody,
    }
    const signIn = mockFunction<[request: SignInRequest], Promise<SignInBody>>(
      async () => signInBody,
    )
    await server.start({ signInMethod: { signIn } })

    const res = await server.request.post(
      '/api/v1/user/sign-in',
      { username: 'drinker', password: 'a long enough password' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, signInBody)
    assertDeepEqual(
      signIn.mock.calls.map((call) => call.arguments),
      [[{ body: { username: 'drinker', password: 'a long enough password' } }]],
    )
  })

  test('refresh without an authorization', async () => {
    const refresh = mockFunction<
      [request: RefreshRequest],
      Promise<TokensBody>
    >(async () => tokensBody)
    await server.start({ signInMethod: { refresh } })

    const res = await server.request.post(
      `/api/v1/user/${userId}/refresh`,
      { refreshToken: 'old refresh token' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, tokensBody)
    assertDeepEqual(
      refresh.mock.calls.map((call) => call.arguments),
      [[{ id: userId, body: { refreshToken: 'old refresh token' } }]],
    )
  })

  test('sign out', async () => {
    const signOut = mockFunction<
      [request: IdBodyRequest],
      Promise<SignOutBody>
    >(async () => ({ success: true }))
    await server.start({ signInMethod: { signOut } })

    const res = await server.request.post(
      `/api/v1/user/${userId}/sign-out`,
      { refreshToken: 'refresh token' },
      headers,
    )

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { success: true })
    assertDeepEqual(
      signOut.mock.calls.map((call) => call.arguments),
      [
        [
          {
            authorization,
            id: userId,
            body: { refreshToken: 'refresh token' },
          },
        ],
      ],
    )
  })

  test('change password', async () => {
    const changePassword = mockFunction<
      [request: IdBodyRequest],
      Promise<void>
    >(async () => undefined)
    await server.start({ signInMethod: { changePassword } })
    const body = {
      oldPassword: 'a long enough password',
      newPassword: 'another long enough password',
    }

    const res = await server.request.post(
      `/api/v1/user/${userId}/change-password`,
      body,
      headers,
    )

    assertEqual(res.status, 204)
    assertEqual(res.data, '')
    assertDeepEqual(
      changePassword.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: userId, body }]],
    )
  })
})
