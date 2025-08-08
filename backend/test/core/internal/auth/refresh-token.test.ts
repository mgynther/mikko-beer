import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import {
  validateRefreshToken
} from '../../../../src/core/internal/auth/refresh-token'
import { invalidRefreshTokenError } from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'

describe('refresh token unit tests', () => {

  it('valid token', async () => {
    const token = {
      refreshToken: 'testing'
    }
    const expected = { ...token }
    const result = validateRefreshToken(token)
    assert.deepEqual(result, expected)
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
