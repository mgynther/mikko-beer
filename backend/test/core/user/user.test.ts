import { expect } from 'chai'

import { validateCreateAnonymousUserRequest } from '../../../src/core/user/user'

describe('user unit tests', () => {
  function pass(user: unknown) {
    expect(validateCreateAnonymousUserRequest(user)).to.equal(true)
  }

  function fail(user: unknown) {
    expect(validateCreateAnonymousUserRequest(user)).to.equal(false)
  }

  it('should pass as admin', () => {
    pass({ role: 'admin' })
  })

  it('should pass as viewer', () => {
    pass({ role: 'viewer' })
  })

  it('should pass as unknown role', () => {
    fail({ role: 'unknown' })
  })

  it('should fail as invalid role', () => {
    fail({ role: 123 })
  })

  it('should fail without role', () => {
    fail({})
  })

  it('should fail with additional property', () => {
    fail({ role: 'admin', additional: true })
  })
})
