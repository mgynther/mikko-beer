import { describe, it } from 'node:test'

import {
  validateRefreshToken
} from '../../../../src/core/internal/auth/refresh-token.js'
import { invalidRefreshTokenError } from '../../../../src/core/errors.js'
import { expectThrow } from '../../controller-error-helper.js'
import { assertDeepEqual } from '../../../assert.js'

describe('refresh token unit tests', () => {

  it('valid token', async () => {
    const token = {
      refreshToken: 'testing'
    }
    const expected = { ...token }
    const result = validateRefreshToken(token)
    assertDeepEqual(result, expected)
  })

  function fail(token: Record<string, unknown>) {
    expectThrow(() => validateRefreshToken(token), invalidRefreshTokenError)
  }

  it('invalid token missing property', async () => {
    const token = {
    }
    fail(token)
  })

  it('invalid token empty property', async () => {
    const token = {
      refreshToken: ''
    }
    fail(token)
  })

  it('invalid token wrong type property', async () => {
    const token = {
      refreshToken: 123
    }
    fail(token)
  })

  it('invalid token extra property', async () => {
    const token = {
      refreshToken: 'testing',
      property: 'extra'
    }
    fail(token)
  })
})
