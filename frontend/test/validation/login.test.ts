import { test } from '../test'
import { assertDeepEqual, assertThrowsWithMessage } from '../assert'
import { validateLogin, validateStoredLogin } from '../../src/validation/login'

const user = {
  id: '9bd0d9ef-dd83-4e0d-a4ec-8e25fd03ba0e',
  username: 'user',
  role: 'admin',
}

test('validate login', () => {
  const login = {
    authToken: 'auth',
    refreshToken: 'refresh',
    user,
  }
  assertDeepEqual(validateLogin(login), login)
})

test('fail to validate login without user', () => {
  assertThrowsWithMessage(
    () => validateLogin({ authToken: 'auth', refreshToken: 'refresh' }),
    'Could not validate data',
  )
})

test('fail to validate login without tokens', () => {
  assertThrowsWithMessage(
    () => validateLogin({ user }),
    'Could not validate data',
  )
})

test('fail to validate login with invalid user', () => {
  assertThrowsWithMessage(
    () =>
      validateLogin({
        authToken: 'auth',
        refreshToken: 'refresh',
        user: { id: 'id' },
      }),
    'Could not validate data',
  )
})

test('validate stored login', () => {
  assertDeepEqual(validateStoredLogin({ user }), { user })
})

test('validate stored login without user as logged out', () => {
  assertDeepEqual(validateStoredLogin({}), { user: undefined })
})

test('fail to validate stored login with invalid user', () => {
  assertThrowsWithMessage(
    () => validateStoredLogin({ user: { id: 'id' } }),
    'Could not validate data',
  )
})
