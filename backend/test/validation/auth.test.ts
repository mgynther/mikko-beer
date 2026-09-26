import { suite, test } from '../test.js'

import { validateRefreshToken } from '../../src/validation/auth.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

suite('refresh token validation unit tests', () => {
  test('valid token passes validation', () => {
    const token = {
      refreshToken: 'testing',
    }
    const expected = { ...token }
    const validationResult = validateRefreshToken(token)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, expected)
  })

  function fail(token: unknown) {
    const validationResult = validateRefreshToken(token)
    assertEqual(validationResult.errorCode, 'invalid-refresh-token')
    assertEqual(validationResult.result, undefined)
  }

  test('invalid token missing property', () => {
    fail({})
  })

  test('invalid token empty property', () => {
    fail({
      refreshToken: '',
    })
  })

  test('invalid token wrong type property', () => {
    fail({
      refreshToken: 123,
    })
  })

  test('invalid token extra property', () => {
    fail({
      refreshToken: 'testing',
      property: 'extra',
    })
  })

  test('invalid token undefined', () => {
    fail(undefined)
  })
})
