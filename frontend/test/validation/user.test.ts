import { test } from '../test'
import { assertDeepEqual, assertThrows } from '../assert'

import type { User, UserList } from '../../src/validation/user'

import {
  validateUserOrUndefined,
  validateUserListOrUndefined,
} from '../../src/validation/user'

const validUser: User = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'admin',
  role: 'admin',
}

test('validateUserOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateUserOrUndefined(undefined), undefined)
})

test('validateUserOrUndefined returns user for valid input', () => {
  assertDeepEqual(validateUserOrUndefined(validUser), validUser)
})

test('validateUserOrUndefined throws for invalid input', () => {
  assertThrows(() =>
    validateUserOrUndefined({
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      username: 123,
    }),
  )
})

test('validateUserListOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateUserListOrUndefined(undefined), undefined)
})

test('validateUserListOrUndefined returns list for valid input', () => {
  const list: UserList = {
    users: [validUser],
  }
  assertDeepEqual(validateUserListOrUndefined(list), list)
})

test('validateUserListOrUndefined throws for invalid input', () => {
  assertThrows(() =>
    validateUserListOrUndefined({
      users: [{ id: 123 }],
    }),
  )
})

test('validateUserListOrUndefined returns empty list', () => {
  const list: UserList = { users: [] }
  assertDeepEqual(validateUserListOrUndefined(list), list)
})
