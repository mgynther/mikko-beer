import { expect, test } from 'vitest'
import { parseRefresh } from './refresh-parser'

test('parse refresh', () => {
  expect(parseRefresh({ authToken: 'auth', refreshToken: 'refresh' })).toEqual({
    authToken: 'auth',
    refreshToken: 'refresh',
  })
})

test('refuse undefined', () => {
  expect(parseRefresh(undefined)).toEqual(undefined)
})

test('refuse null', () => {
  expect(parseRefresh(null)).toEqual(undefined)
})

test('refuse non-object', () => {
  expect(parseRefresh('auth')).toEqual(undefined)
})

test('refuse missing auth token', () => {
  expect(parseRefresh({ refreshToken: 'refresh' })).toEqual(undefined)
})

test('refuse missing refresh token', () => {
  expect(parseRefresh({ authToken: 'auth' })).toEqual(undefined)
})

test('refuse non-string auth token', () => {
  expect(parseRefresh({ authToken: 1, refreshToken: 'refresh' })).toEqual(
    undefined,
  )
})

test('refuse non-string refresh token', () => {
  expect(parseRefresh({ authToken: 'auth', refreshToken: 1 })).toEqual(
    undefined,
  )
})

test('refuse empty auth token', () => {
  expect(parseRefresh({ authToken: '', refreshToken: 'refresh' })).toEqual(
    undefined,
  )
})

test('refuse empty refresh token', () => {
  expect(parseRefresh({ authToken: 'auth', refreshToken: '' })).toEqual(
    undefined,
  )
})
