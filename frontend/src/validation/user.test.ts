import { expect, test } from 'vitest'

import type {
  User,
  UserList
} from '../core/user/types'

import {
  validateUserOrUndefined,
  validateUserListOrUndefined
} from './user'

const validUser: User = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'admin',
  role: 'admin'
}

test('validateUserOrUndefined returns undefined for undefined', () => {
  expect(validateUserOrUndefined(undefined)).toEqual(undefined)
})

test('validateUserOrUndefined returns user for valid input', () => {
  expect(validateUserOrUndefined(validUser)).toEqual(validUser)
})

test('validateUserOrUndefined throws for invalid input', () => {
  expect(() => validateUserOrUndefined({
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    username: 123
  })).toThrow()
})

test('validateUserListOrUndefined returns undefined for undefined', () => {
  expect(validateUserListOrUndefined(undefined)).toEqual(undefined)
})

test('validateUserListOrUndefined returns list for valid input', () => {
  const list: UserList = {
    users: [validUser]
  }
  expect(validateUserListOrUndefined(list)).toEqual(list)
})

test('validateUserListOrUndefined throws for invalid input', () => {
  expect(() => validateUserListOrUndefined({
    users: [{ id: 123 }]
  })).toThrow()
})

test('validateUserListOrUndefined returns empty list', () => {
  const list: UserList = { users: [] }
  expect(validateUserListOrUndefined(list)).toEqual(list)
})
