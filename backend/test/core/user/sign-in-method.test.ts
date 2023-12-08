import { expect } from 'chai'

import {
  validatePasswordSignInMethod,
  validatePasswordChange
} from '../../../src/core/user/sign-in-method'

describe('password sign-in-method unit tests', () => {
  function validPasswordSignInMethod () {
    return {
      username: 'user',
      password: 'pwd'
    }
  }

  function pass(signInMethod: unknown) {
    expect(validatePasswordSignInMethod(signInMethod)).to.equal(true)
  }

  function fail(signInMethod: unknown) {
    expect(validatePasswordSignInMethod(signInMethod)).to.equal(false)
  }

  it('should pass validation', () => {
    pass(validPasswordSignInMethod())
  })

  it('should fail with empty username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: ''
    }
    fail(request)
  })

  it('should fail with invalid username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: 1
    }
    fail(request)
  })

  it('should fail without username', () => {
    const { password } = validPasswordSignInMethod()
    fail({ password })
  })

  it('should fail with empty password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: ''
    }
    fail(request)
  })

  it('should fail with invalid password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: {}
    }
    fail(request)
  })

  it('should fail without password', () => {
    const { username } = validPasswordSignInMethod()
    fail({ username })
  })

  it('should fail with additional property', () => {
    fail({ ...validPasswordSignInMethod(), additional: true })
  })
})

describe('password change unit tests', () => {
  function validPasswordChange () {
    return {
      oldPassword: 'pwd1',
      newPassword: 'pwd2'
    }
  }

  function pass(passwordChange: unknown) {
    expect(validatePasswordChange(passwordChange)).to.equal(true)
  }

  function fail(passwordChange: unknown) {
    expect(validatePasswordChange(passwordChange)).to.equal(false)
  }

  it('should pass validation', () => {
    pass(validPasswordChange())
  })

  it('should fail with empty old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: ''
    }
    fail(request)
  })

  it('should fail with invalid old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: 1
    }
    fail(request)
  })

  it('should fail without old password', () => {
    const { newPassword } = validPasswordChange()
    fail({ newPassword })
  })

  it('should fail with empty new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: ''
    }
    fail(request)
  })

  it('should fail with invalid new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: {}
    }
    fail(request)
  })

  it('should fail without new password', () => {
    const { oldPassword } = validPasswordChange()
    fail({ oldPassword })
  })

  it('should fail with additional property', () => {
    fail({ ...validPasswordChange(), additional: true })
  })
})
