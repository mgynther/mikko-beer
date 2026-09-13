import { describe, it } from 'node:test'

import type { SearchByName } from '../../src/validation/search.js'
import { validateSearchByName } from '../../src/validation/search.js'

import { assertDeepEqual, assertEqual } from '../assert.js'

describe('search validation unit tests', () => {
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
  it('pass validation', () => {
    pass({ name: 'testing' }, { name: 'testing' })
  })
  it('fail with empty name', () => {
    fail({ name: '' })
  })
  it('fail with missing name', () => {
    fail({})
  })
  it('fail with additional property', () => {
    fail({ name: 'testing', something: 123 })
  })
  it('fail with wrong type', () => {
    fail({ name: 123 })
  })
  it('fail with undefined', () => {
    fail(undefined)
  })
})
