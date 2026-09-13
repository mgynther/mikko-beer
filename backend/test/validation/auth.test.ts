import { describe, it } from 'node:test'

import { validateRefreshToken } from '../../src/validation/auth.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

describe('refresh token validation unit tests', () => {
  it('valid token passes validation', () => {
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

  it('invalid token missing property', () => {
    fail({})
  })

  it('invalid token empty property', () => {
    fail({
      refreshToken: '',
    })
  })

  it('invalid token wrong type property', () => {
    fail({
      refreshToken: 123,
    })
  })

  it('invalid token extra property', () => {
    fail({
      refreshToken: 'testing',
      property: 'extra',
    })
  })

  it('invalid token undefined', () => {
    fail(undefined)
  })
})
