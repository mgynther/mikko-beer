import { expect, test } from 'vitest'
import { validateLogin } from './login'

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
  expect(validateLogin(login)).toEqual(login)
})

test('validate login without user', () => {
  const login = {
    authToken: 'auth',
    refreshToken: 'refresh',
    user: undefined,
  }
  expect(validateLogin(login)).toEqual(login)
})

test('fail to validate login without tokens', () => {
  expect(() => validateLogin({ user })).toThrow('Could not validate data')
})

test('fail to validate login with invalid user', () => {
  expect(() =>
    validateLogin({
      authToken: 'auth',
      refreshToken: 'refresh',
      user: { id: 'id' },
    }),
  ).toThrow('Could not validate data')
})
