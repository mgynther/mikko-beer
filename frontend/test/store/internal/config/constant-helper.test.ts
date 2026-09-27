import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import {
  getBackendUrl,
  getUniqueTestServerPort,
  parseTestPortStart,
  parseVitestId,
} from '../../../../src/store/internal/config/constant-helper'

test('parse number test port start', () => {
  assertEqual(parseTestPortStart('3000'), 3000)
})

test('parse empty test port start', () => {
  assertEqual(parseTestPortStart(''), -1)
})

test('parse undefined test port start', () => {
  assertEqual(parseTestPortStart(undefined), -1)
})

test('parse number vitest id', () => {
  assertEqual(parseVitestId('3000'), 3000)
})

test('parse empty vitest id', () => {
  assertEqual(parseVitestId(''), -1)
})

test('parse undefined vitest id', () => {
  assertEqual(parseVitestId(undefined), -1)
})

test('get unique test port in node', () => {
  assertEqual(getUniqueTestServerPort(12, 30000), 30012)
})

test('get default unique test port in browser', () => {
  assertEqual(getUniqueTestServerPort(-1, -1), 0)
})

test('get unique backend url in node', () => {
  assertEqual(getBackendUrl(12, 30012, undefined), 'http://localhost:30012')
})

test('get configured backend url in browser', () => {
  assertEqual(
    getBackendUrl(-1, 0, 'http://backend:1234'),
    'http://backend:1234',
  )
})

test('get default backend url in browser', () => {
  assertEqual(getBackendUrl(-1, 0, undefined), 'http://localhost:3001')
})
