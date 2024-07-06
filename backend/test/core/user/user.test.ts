import { expect } from 'chai'

import {
  validateCreateAnonymousUserRequest,
  validateCreateUserRequest
} from '../../../src/core/user/user'
import {
  invalidSignInMethodError,
  invalidUserError
} from '../../../src/core/errors'

describe('create anonymous user unit tests', () => {
  function pass(user: Record<string, unknown>) {
    const input = { ...user }
    const output = { ...user }
    expect(validateCreateAnonymousUserRequest(input)).to.eql(output)
  }

  function fail(user: unknown) {
    expect(
      () => validateCreateAnonymousUserRequest(user)
    ).to.throw(invalidUserError)
  }

  it('pass as admin', () => {
    pass({ role: 'admin' })
  })

  it('pass as viewer', () => {
    pass({ role: 'viewer' })
  })

  it('pass as unknown role', () => {
    fail({ role: 'unknown' })
  })

  it('fail as invalid role', () => {
    fail({ role: 123 })
  })

  it('fail without role', () => {
    fail({})
  })

  it('fail with additional property', () => {
    fail({ role: 'admin', additional: true })
  })
})


describe('create user unit tests', () => {
  const validRequest = {
    user: {
      role: 'admin'
    },
    passwordSignInMethod: {
      username: 'admin',
      password: 'admin'
    }
  }

  it('pass with valid request', () => {
    const expected = {
      role: 'admin',
      passwordSignInMethod: {
        ...validRequest.passwordSignInMethod
      }
    }
    expect(validateCreateUserRequest(validRequest)).to.eql(expected)
  })

  it('fail with invalid user', () => {
    const request = {
      user: {},
      passwordSignInMethod: { ...validRequest.passwordSignInMethod }
    }
    expect(
      () => validateCreateUserRequest(request)
    ).to.throw(invalidUserError)
  })

  it('fail with invalid password change method', () => {
    const request = {
      user: { ...validRequest.user },
      passwordSignInMethod: { }
    }
    expect(
      () => validateCreateUserRequest(request)
    ).to.throw(invalidSignInMethodError)
  })
})
