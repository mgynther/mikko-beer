import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { parseSession } from '../../../src/store/internal/session-parser'

const session = {
  authToken: 'auth',
  refreshToken: 'refresh',
  user: {
    id: '1f0b6a7e-3c1d-4e8f-9a2b-5c6d7e8f9a0b',
    username: 'user1',
    role: 'admin',
  },
}

test('parse session', () => {
  assertDeepEqual(parseSession(JSON.stringify(session)), session)
})

test('parse only the members of a session', () => {
  assertDeepEqual(
    parseSession(
      JSON.stringify({
        ...session,
        extra: 'extra',
        user: { ...session.user, extra: 'extra' },
      }),
    ),
    session,
  )
})

test('refuse nothing stored', () => {
  assertDeepEqual(parseSession(null), undefined)
})

test('refuse what is not JSON', () => {
  assertDeepEqual(parseSession('{"authToken":'), undefined)
})

test('refuse null', () => {
  assertDeepEqual(parseSession('null'), undefined)
})

test('refuse what is not an object', () => {
  assertDeepEqual(parseSession('"auth"'), undefined)
})

const withoutMembers = [
  { name: 'auth token', value: { ...session, authToken: undefined } },
  { name: 'refresh token', value: { ...session, refreshToken: undefined } },
  { name: 'user', value: { ...session, user: undefined } },
  {
    name: 'user id',
    value: { ...session, user: { ...session.user, id: undefined } },
  },
  {
    name: 'username',
    value: { ...session, user: { ...session.user, username: undefined } },
  },
  {
    name: 'role',
    value: { ...session, user: { ...session.user, role: undefined } },
  },
]

withoutMembers.forEach((testCase) => {
  test(`refuse a session without ${testCase.name}`, () => {
    assertDeepEqual(parseSession(JSON.stringify(testCase.value)), undefined)
  })
})

const wrongMembers = [
  { name: 'auth token', value: { ...session, authToken: 1 } },
  { name: 'empty auth token', value: { ...session, authToken: '' } },
  { name: 'refresh token', value: { ...session, refreshToken: 1 } },
  { name: 'empty refresh token', value: { ...session, refreshToken: '' } },
  { name: 'user', value: { ...session, user: 'user1' } },
  { name: 'null user', value: { ...session, user: null } },
  { name: 'user id', value: { ...session, user: { ...session.user, id: 1 } } },
  {
    name: 'username',
    value: { ...session, user: { ...session.user, username: 1 } },
  },
  { name: 'role', value: { ...session, user: { ...session.user, role: 1 } } },
]

wrongMembers.forEach((testCase) => {
  test(`refuse a session with a wrong ${testCase.name}`, () => {
    assertDeepEqual(parseSession(JSON.stringify(testCase.value)), undefined)
  })
})
