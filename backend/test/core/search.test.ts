import { describe, it } from 'node:test'

import type { SearchByName } from '../../src/core/search.js'
import { validateSearchByName } from '../../src/core/search.js'

import { invalidSearchError } from '../../src/core/errors.js'
import { expectThrow } from './controller-error-helper.js'
import { assertDeepEqual } from '../assert.js'

describe('search validation unit tests', () => {
  function pass(input: unknown, output: SearchByName) {
    assertDeepEqual(validateSearchByName(input), output)
  }
  function fail(input: unknown) {
    expectThrow(() => validateSearchByName(input), invalidSearchError)
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
})
