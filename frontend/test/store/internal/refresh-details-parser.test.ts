import { test } from '../../test'
import { assertDeepEqual, assertEqual } from '../../assert'
import {
  parseAuthToken,
  parseRefreshDetails,
} from '../../../src/store/internal/refresh-details-parser'

test('defaults refresh details to empty strings on store missing', () => {
  const result = parseRefreshDetails(undefined)
  assertDeepEqual(result, {
    userId: '',
    refreshToken: '',
  })
})

test('defaults refresh details to empty string on user missing', () => {
  const state = {
    login: {
      login: {
        user: undefined,
        refreshToken: 'refresh',
      },
    },
  }
  const result = parseRefreshDetails(state)
  assertDeepEqual(result, {
    userId: '',
    refreshToken: 'refresh',
  })
})

test('returns userId and refresh token when found', () => {
  const userId = 'dc01cbf1-245a-4c33-ade7-5025dc8ade72'
  const state = {
    login: {
      login: {
        user: {
          id: userId,
          username: 'admin',
          role: 'admin',
        },
        refreshToken: 'refresh',
      },
    },
  }
  const result = parseRefreshDetails(state)
  assertDeepEqual(result, {
    userId,
    refreshToken: 'refresh',
  })
})

test('defaults auth token to empty string on store missing', () => {
  assertEqual(parseAuthToken(undefined), '')
})

test('returns auth token when found', () => {
  const state = {
    login: {
      login: {
        authToken: 'auth',
      },
    },
  }
  assertEqual(parseAuthToken(state), 'auth')
})
