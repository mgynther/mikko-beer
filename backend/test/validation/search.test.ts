import { suite, test } from '../test.js'

import type { SearchByName } from '../../src/validation/search.js'
import { validateSearchByName } from '../../src/validation/search.js'

import { assertDeepEqual, assertEqual } from '../assert.js'

suite('search validation unit tests', () => {
  function pass(input: unknown, output: SearchByName) {
    const validationResult = validateSearchByName(input)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }
  function fail(input: unknown) {
    const validationResult = validateSearchByName(input)
    assertEqual(validationResult.errorCode, 'invalid-search')
    assertEqual(validationResult.result, undefined)
  }
  test('pass validation', () => {
    pass({ name: 'testing' }, { name: 'testing' })
  })
  test('fail with empty name', () => {
    fail({ name: '' })
  })
  test('fail with missing name', () => {
    fail({})
  })
  test('fail with additional property', () => {
    fail({ name: 'testing', something: 123 })
  })
  test('fail with wrong type', () => {
    fail({ name: 123 })
  })
  test('fail with undefined', () => {
    fail(undefined)
  })
})
