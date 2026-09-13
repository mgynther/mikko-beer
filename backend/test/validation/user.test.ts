import { describe, it } from 'node:test'

import {
  validateCreateAnonymousUserRequest,
  validateCreateUserRequest,
  validatePasswordChange,
  validatePasswordSignInMethod,
  validateUserId,
} from '../../src/validation/user.js'
import type {
  CreateAnonymousUserRequest,
  PasswordChange,
  PasswordSignInMethod,
} from '../../src/validation/user.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

describe('create anonymous user validation unit tests', () => {
  function pass(user: CreateAnonymousUserRequest) {
    const input = { ...user }
    const output = { ...user }
    const validationResult = validateCreateAnonymousUserRequest(input)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }

  function fail(user: unknown) {
    const validationResult = validateCreateAnonymousUserRequest(user)
    assertEqual(validationResult.errorCode, 'invalid-user')
    assertEqual(validationResult.result, undefined)
  }

  it('pass as admin', () => {
    pass({ role: 'admin' })
  })

  it('pass as viewer', () => {
    pass({ role: 'viewer' })
  })

  it('fail as unknown role', () => {
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
      role: 'admin',
    },
    passwordSignInMethod: {
      username: 'admin',
      password: 'admin',
    },
  }

  it('pass with valid request', () => {
    const expected = {
      role: 'admin',
      passwordSignInMethod: {
        ...validRequest.passwordSignInMethod,
      },
    }
    const validationResult = validateCreateUserRequest(validRequest)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, expected)
  })

  it('fail with invalid user', () => {
    const request = {
      user: {},
      passwordSignInMethod: { ...validRequest.passwordSignInMethod },
    }
    const validationResult = validateCreateUserRequest(request)
    assertEqual(validationResult.errorCode, 'invalid-user')
    assertEqual(validationResult.result, undefined)
  })

  it('fail with invalid password sign-in method', () => {
    const request = {
      user: { ...validRequest.user },
      passwordSignInMethod: {},
    }
    const validationResult = validateCreateUserRequest(request)
    assertEqual(validationResult.errorCode, 'invalid-sign-in-method')
    assertEqual(validationResult.result, undefined)
  })

  it('fail with empty request', () => {
    const validationResult = validateCreateUserRequest({})
    assertEqual(validationResult.errorCode, 'invalid-user')
    assertEqual(validationResult.result, undefined)
  })
})

describe('user id validation unit tests', () => {
  it('valid user id passes validation', () => {
    const id = 'e5d1f1a6-9f10-4c52-9b7b-9a35c7b7d3c8'
    const validationResult = validateUserId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  interface InvalidIdCase {
    label: string
    id: string | undefined
  }
  const invalidIdCases: InvalidIdCase[] = [
    { label: 'empty string', id: '' },
    { label: 'undefined', id: undefined },
  ]

  invalidIdCases.forEach((testCase) =>
    it(`invalid user id "${testCase.label}" fails validation`, () => {
      const validationResult = validateUserId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-user-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})

describe('password sign-in-method validation unit tests', () => {
  function validPasswordSignInMethod() {
    return {
      username: 'user',
      password: 'pwd',
    }
  }

  function pass(signInMethod: PasswordSignInMethod) {
    const input = { ...signInMethod }
    const output = { ...signInMethod }
    const validationResult = validatePasswordSignInMethod(input)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }

  function fail(signInMethod: unknown) {
    const validationResult = validatePasswordSignInMethod(signInMethod)
    assertEqual(validationResult.errorCode, 'invalid-sign-in-method')
    assertEqual(validationResult.result, undefined)
  }

  it('pass validation', () => {
    pass(validPasswordSignInMethod())
  })

  it('fail with empty username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: '',
    }
    fail(request)
  })

  it('fail with invalid username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: 1,
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
      password: '',
    }
    fail(request)
  })

  it('fail with invalid password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: {},
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

describe('password change validation unit tests', () => {
  function validPasswordChange() {
    return {
      oldPassword: 'pwd1',
      newPassword: 'pwd2',
    }
  }

  function pass(passwordChange: PasswordChange) {
    const input = { ...passwordChange }
    const output = { ...passwordChange }
    const validationResult = validatePasswordChange(input)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }

  function fail(passwordChange: unknown) {
    const validationResult = validatePasswordChange(passwordChange)
    assertEqual(validationResult.errorCode, 'invalid-password-change')
    assertEqual(validationResult.result, undefined)
  }

  it('pass validation', () => {
    pass(validPasswordChange())
  })

  it('fail with empty old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: '',
    }
    fail(request)
  })

  it('fail with invalid old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: 1,
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
      newPassword: '',
    }
    fail(request)
  })

  it('fail with invalid new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: {},
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
