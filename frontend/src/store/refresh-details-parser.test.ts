import { expect, test } from "vitest"
import { parseRefreshDetails } from "./refresh-details-parser"

test('defaults refresh details to empty strings on store missing', () => {
  const result = parseRefreshDetails(undefined)
  expect(result).toEqual({
    userId: '',
    refreshToken: ''
  })
})

test('defaults refresh details to empty string on user missing', () => {
  const state = {
    login: {
      login: {
        user: undefined,
        refreshToken: 'refresh'
      }
    }
  }
  const result = parseRefreshDetails(state)
  expect(result).toEqual({
    userId: '',
    refreshToken: 'refresh'
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
          role: 'admin'
        },
        refreshToken: 'refresh'
      }
    }
  }
  const result = parseRefreshDetails(state)
  expect(result).toEqual({
    userId,
    refreshToken: 'refresh'
  })
})
