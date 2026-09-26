import { suite, test } from '../test.js'

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

suite('create anonymous user validation unit tests', () => {
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

  test('pass as admin', () => {
    pass({ role: 'admin' })
  })

  test('pass as viewer', () => {
    pass({ role: 'viewer' })
  })

  test('fail as unknown role', () => {
    fail({ role: 'unknown' })
  })

  test('fail as invalid role', () => {
    fail({ role: 123 })
  })

  test('fail without role', () => {
    fail({})
  })

  test('fail with additional property', () => {
    fail({ role: 'admin', additional: true })
  })
})

suite('create user validation unit tests', () => {
  const validRequest = {
    user: {
      role: 'admin',
    },
    passwordSignInMethod: {
      username: 'admin',
      password: 'admin',
    },
  }

  test('pass with valid request', () => {
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

  test('fail with invalid user', () => {
    const request = {
      user: {},
      passwordSignInMethod: { ...validRequest.passwordSignInMethod },
    }
    const validationResult = validateCreateUserRequest(request)
    assertEqual(validationResult.errorCode, 'invalid-user')
    assertEqual(validationResult.result, undefined)
  })

  test('fail with invalid password sign-in method', () => {
    const request = {
      user: { ...validRequest.user },
      passwordSignInMethod: {},
    }
    const validationResult = validateCreateUserRequest(request)
    assertEqual(validationResult.errorCode, 'invalid-sign-in-method')
    assertEqual(validationResult.result, undefined)
  })

  test('fail with empty request', () => {
    const validationResult = validateCreateUserRequest({})
    assertEqual(validationResult.errorCode, 'invalid-user')
    assertEqual(validationResult.result, undefined)
  })
})

suite('user id validation unit tests', () => {
  test('valid user id passes validation', () => {
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
    test(`invalid user id "${testCase.label}" fails validation`, () => {
      const validationResult = validateUserId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-user-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})

suite('password sign-in-method validation unit tests', () => {
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

  test('pass validation', () => {
    pass(validPasswordSignInMethod())
  })

  test('fail with empty username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: '',
    }
    fail(request)
  })

  test('fail with invalid username', () => {
    const request = {
      ...validPasswordSignInMethod(),
      username: 1,
    }
    fail(request)
  })

  test('fail without username', () => {
    const { password } = validPasswordSignInMethod()
    fail({ password })
  })

  test('fail with empty password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: '',
    }
    fail(request)
  })

  test('fail with invalid password', () => {
    const request = {
      ...validPasswordSignInMethod(),
      password: {},
    }
    fail(request)
  })

  test('fail without password', () => {
    const { username } = validPasswordSignInMethod()
    fail({ username })
  })

  test('fail with additional property', () => {
    fail({ ...validPasswordSignInMethod(), additional: true })
  })
})

suite('password change validation unit tests', () => {
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

  test('pass validation', () => {
    pass(validPasswordChange())
  })

  test('fail with empty old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: '',
    }
    fail(request)
  })

  test('fail with invalid old password', () => {
    const request = {
      ...validPasswordChange(),
      oldPassword: 1,
    }
    fail(request)
  })

  test('fail without old password', () => {
    const { newPassword } = validPasswordChange()
    fail({ newPassword })
  })

  test('fail with empty new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: '',
    }
    fail(request)
  })

  test('fail with invalid new password', () => {
    const request = {
      ...validPasswordChange(),
      newPassword: {},
    }
    fail(request)
  })

  test('fail without new password', () => {
    const { oldPassword } = validPasswordChange()
    fail({ oldPassword })
  })

  test('fail with additional property', () => {
    fail({ ...validPasswordChange(), additional: true })
  })
})
