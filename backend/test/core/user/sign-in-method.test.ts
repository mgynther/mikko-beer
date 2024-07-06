import { expect } from 'chai'

import {
  validatePasswordSignInMethod,
  validatePasswordChange
} from '../../../src/core/user/sign-in-method'

import {
  invalidPasswordChangeError,
  invalidSignInMethodError,
} from '../../../src/core/errors'

describe('password sign-in-method unit tests', () => {
  function validPasswordSignInMethod () {
    return {
      username: 'user',
      password: 'pwd'
    }
  }

  function pass(signInMethod: Record<string, unknown>) {
    const input = { ...signInMethod }
    const output = { ...signInMethod }
    expect(validatePasswordSignInMethod(input)).to.eql(output)
  }

  function fail(signInMethod: unknown) {
    expect(
      () => validatePasswordSignInMethod(signInMethod)
    ).to.throw(invalidSignInMethodError)
  }

  it('pass validation', () => {
    pass(validPasswordSignInMethod())
  })

  it('fail with empty username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: ''
    }
    fail(request)
  })

  it('fail with invalid username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: 1
    }
    fail(request)
  })

  it('fail without username', () => {
    const { password } = validPasswordSignInMethod()
    fail({ password })
  })

  it('fail with empty password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: ''
    }
    fail(request)
  })

  it('fail with invalid password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: {}
    }
    fail(request)
  })

  it('fail without password', () => {
    const { username } = validPasswordSignInMethod()
    fail({ username })
  })

  it('fail with additional property', () => {
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

  function pass(passwordChange: Record<string, unknown>) {
    const input = { ...passwordChange }
    const output = { ...passwordChange }
    expect(validatePasswordChange(input)).to.eql(output)
  }

  function fail(passwordChange: unknown) {
    expect(
      () => validatePasswordChange(passwordChange)
    ).to.throw(invalidPasswordChangeError)
  }

  it('pass validation', () => {
    pass(validPasswordChange())
  })

  it('fail with empty old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: ''
    }
    fail(request)
  })

  it('fail with invalid old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: 1
    }
    fail(request)
  })

  it('fail without old password', () => {
    const { newPassword } = validPasswordChange()
    fail({ newPassword })
  })

  it('fail with empty new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: ''
    }
    fail(request)
  })

  it('fail with invalid new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: {}
    }
    fail(request)
  })

  it('fail without new password', () => {
    const { oldPassword } = validPasswordChange()
    fail({ oldPassword })
  })

  it('fail with additional property', () => {
    fail({ ...validPasswordChange(), additional: true })
  })
})
