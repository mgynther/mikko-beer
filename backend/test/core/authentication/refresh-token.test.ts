import { expect } from 'chai'
import {
  validateRefreshToken
} from '../../../src/core/authentication/refresh-token'
import { invalidRefreshTokenError } from '../../../src/core/errors'

describe('refresh token unit tests', () => {

  it('valid token', async () => {
    const token = {
      refreshToken: 'testing'
    }
    const expected = { ...token }
    const result = validateRefreshToken(token)
    expect(result).to.eql(expected)
  })

  function fail(token: Record<string, unknown>) {
    expect(() => validateRefreshToken(token)).to.throw(invalidRefreshTokenError)
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
