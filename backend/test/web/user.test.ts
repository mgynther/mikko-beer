import { suite, test, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type {
  CreatedUserBody,
  ReadUserBody,
  UserListBody,
} from '../../src/web/user/user.js'
import type {
  AuthorizedRequest,
  BodyRequest,
  IdRequest,
} from '../../src/web/request.js'
import { TestServer } from './test-server.js'

const authorization = 'Bearer token'
const headers = { Authorization: authorization }

const userId = 'a4b2c9d1-7e3f-4a5b-9c8d-0e1f2a3b4c5d'

const user = { id: userId, role: 'viewer' as const, username: 'drinker' }

suite('user routes', () => {
  const server = new TestServer()

  afterEach(server.afterEach)

  test('create a user', async () => {
    const createdBody: CreatedUserBody = {
      user,
      authToken: 'auth token',
      refreshToken: 'refresh token',
    }
    const create = mockFunction<
      [request: BodyRequest],
      Promise<CreatedUserBody>
    >(async () => createdBody)
    await server.start({ user: { create } })
    const body = {
      user: { role: 'viewer' },
      passwordSignInMethod: {
        username: 'drinker',
        password: 'a long enough password',
      },
    }

    const res = await server.request.post('/api/v1/user', body, headers)

    assertEqual(res.status, 201)
    assertDeepEqual(res.data, createdBody)
    assertDeepEqual(
      create.mock.calls.map((call) => call.arguments),
      [[{ authorization, body }]],
    )
  })

  test('find a user', async () => {
    const find = mockFunction<[request: IdRequest], Promise<ReadUserBody>>(
      async () => ({ user }),
    )
    await server.start({ user: { find } })

    const res = await server.request.get(`/api/v1/user/${userId}`, headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { user })
    assertDeepEqual(
      find.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: userId }]],
    )
  })

  test('list users', async () => {
    const list = mockFunction<
      [request: AuthorizedRequest],
      Promise<UserListBody>
    >(async () => ({ users: [user] }))
    await server.start({ user: { list } })

    const res = await server.request.get('/api/v1/user', headers)

    assertEqual(res.status, 200)
    assertDeepEqual(res.data, { users: [user] })
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ authorization }]],
    )
  })

  test('delete a user', async () => {
    const deleteUser = mockFunction<[request: IdRequest], Promise<void>>(
      async () => undefined,
    )
    await server.start({ user: { delete: deleteUser } })

    const res = await server.request.delete(`/api/v1/user/${userId}`, headers)

    assertEqual(res.status, 204)
    assertEqual(res.data, '')
    assertDeepEqual(
      deleteUser.mock.calls.map((call) => call.arguments),
      [[{ authorization, id: userId }]],
    )
  })
})
