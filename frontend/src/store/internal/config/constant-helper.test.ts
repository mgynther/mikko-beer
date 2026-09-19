import { expect, test } from 'vitest'
import {
  getBackendUrl,
  getUniqueTestServerPort,
  parseTestPortStart,
  parseVitestId,
} from './constant-helper'

test('parse number test port start', () => {
  expect(parseTestPortStart('3000')).toEqual(3000)
})

test('parse empty test port start', () => {
  expect(parseTestPortStart('')).toEqual(-1)
})

test('parse undefined test port start', () => {
  expect(parseTestPortStart(undefined)).toEqual(-1)
})

test('parse number vitest id', () => {
  expect(parseVitestId('3000')).toEqual(3000)
})

test('parse empty vitest id', () => {
  expect(parseVitestId('')).toEqual(-1)
})

test('parse undefined vitest id', () => {
  expect(parseVitestId(undefined)).toEqual(-1)
})

test('get unique test port in node', () => {
  expect(getUniqueTestServerPort(12, 30000)).toEqual(30012)
})

test('get default unique test port in browser', () => {
  expect(getUniqueTestServerPort(-1, -1)).toEqual(0)
})

test('get unique backend url in node', () => {
  expect(getBackendUrl(12, 30012)).toEqual('http://localhost:30012')
})

test('get default backend url in browser', () => {
  expect(getBackendUrl(-1, 0)).toEqual('http://localhost:3001')
})
