import { describe, it } from 'node:test'

import {
  validatePasswordSignInMethod,
  validatePasswordChange
} from '../../../../src/core/internal/user/sign-in-method.validation'

import {
  invalidPasswordChangeError,
  invalidSignInMethodError,
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'
import type {
  PasswordChange,
  PasswordSignInMethod
} from '../../../../src/core/user/sign-in-method'

describe('password sign-in-method validation unit tests', () => {
  function validPasswordSignInMethod () {
    return {
      username: 'user',
      password: 'pwd'
    }
  }

  function pass(signInMethod: PasswordSignInMethod) {
    const input = { ...signInMethod }
    const output = { ...signInMethod }
    assertDeepEqual(validatePasswordSignInMethod(input), output)
  }

  function fail(signInMethod: unknown) {
    expectThrow(
      () => validatePasswordSignInMethod(signInMethod)
    , invalidSignInMethodError)
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

  function pass(passwordChange: PasswordChange) {
    const input = { ...passwordChange }
    const output = { ...passwordChange }
    assertDeepEqual(validatePasswordChange(input), output)
  }

  function fail(passwordChange: unknown) {
    expectThrow(
      () => validatePasswordChange(passwordChange)
    , invalidPasswordChangeError)
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
