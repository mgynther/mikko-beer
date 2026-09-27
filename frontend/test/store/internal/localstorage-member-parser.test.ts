import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { asObject } from '../../../src/store/internal/localstorage-member-parser'

test('defaults to empty object on null', () => {
  const result = asObject(null)
  assertDeepEqual(result, {})
})

test('defaults to empty object on undefined', () => {
  const result = asObject(undefined)
  assertDeepEqual(result, {})
})

test('returns object on a valid object', () => {
  const obj = { test: 123 }
  const result = asObject(obj)
  assertDeepEqual(result, obj)
})
