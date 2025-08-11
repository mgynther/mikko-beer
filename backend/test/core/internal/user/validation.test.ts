import { describe, it } from 'node:test'

import {
  validateCreateAnonymousUserRequest,
  validateCreateUserRequest
} from '../../../../src/core/internal/user/validation'
import {
  invalidSignInMethodError,
  invalidUserError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'
import type { CreateAnonymousUserRequest } from '../../../../src/core/user/user'

describe('create anonymous user validation unit tests', () => {
  function pass(user: CreateAnonymousUserRequest) {
    const input = { ...user }
    const output = { ...user }
    assertDeepEqual(validateCreateAnonymousUserRequest(input), output)
  }

  function fail(user: unknown) {
    expectThrow(
      () => validateCreateAnonymousUserRequest(user)
    , invalidUserError)
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


describe('create user validation unit tests', () => {
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
    assertDeepEqual(validateCreateUserRequest(validRequest), expected)
  })

  it('fail with invalid user', () => {
    const request = {
      user: {},
      passwordSignInMethod: { ...validRequest.passwordSignInMethod }
    }
    expectThrow(
      () => validateCreateUserRequest(request)
    , invalidUserError)
  })

  it('fail with invalid password change method', () => {
    const request = {
      user: { ...validRequest.user },
      passwordSignInMethod: { }
    }
    expectThrow(
      () => validateCreateUserRequest(request)
    , invalidSignInMethodError)
  })
})
