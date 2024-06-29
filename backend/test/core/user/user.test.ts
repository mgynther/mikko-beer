import { expect } from 'chai'

import { validateCreateAnonymousUserRequest } from '../../../src/core/user/user'

describe('user unit tests', () => {
  function pass(user: unknown) {
    expect(validateCreateAnonymousUserRequest(user)).to.equal(true)
  }

  function fail(user: unknown) {
    expect(validateCreateAnonymousUserRequest(user)).to.equal(false)
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
