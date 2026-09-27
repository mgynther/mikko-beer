import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { parseRefresh } from '../../../src/store/internal/refresh-parser'

test('parse refresh', () => {
  assertDeepEqual(
    parseRefresh({ authToken: 'auth', refreshToken: 'refresh' }),
    {
      authToken: 'auth',
      refreshToken: 'refresh',
    },
  )
})

test('refuse undefined', () => {
  assertDeepEqual(parseRefresh(undefined), undefined)
})

test('refuse null', () => {
  assertDeepEqual(parseRefresh(null), undefined)
})

test('refuse non-object', () => {
  assertDeepEqual(parseRefresh('auth'), undefined)
})

test('refuse missing auth token', () => {
  assertDeepEqual(parseRefresh({ refreshToken: 'refresh' }), undefined)
})

test('refuse missing refresh token', () => {
  assertDeepEqual(parseRefresh({ authToken: 'auth' }), undefined)
})

test('refuse non-string auth token', () => {
  assertDeepEqual(
    parseRefresh({ authToken: 1, refreshToken: 'refresh' }),
    undefined,
  )
})

test('refuse non-string refresh token', () => {
  assertDeepEqual(
    parseRefresh({ authToken: 'auth', refreshToken: 1 }),
    undefined,
  )
})

test('refuse empty auth token', () => {
  assertDeepEqual(
    parseRefresh({ authToken: '', refreshToken: 'refresh' }),
    undefined,
  )
})

test('refuse empty refresh token', () => {
  assertDeepEqual(
    parseRefresh({ authToken: 'auth', refreshToken: '' }),
    undefined,
  )
})
