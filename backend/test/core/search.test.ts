import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type { SearchByName } from '../../src/core/search'
import { toIlike, validateSearchByName } from '../../src/core/search'

import { invalidSearchError } from '../../src/core/errors'
import { expectThrow } from './controller-error-helper'

describe('search validation unit tests', () => {
  function pass(input: unknown, output: SearchByName) {
    assert.deepEqual(validateSearchByName(input), output)
  }
  function fail(input: unknown) {
    expectThrow(() => (validateSearchByName(input)), invalidSearchError)
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

describe('search ilike unit tests', () => {
  it('add wildcards', () => {
    assert.equal(toIlike({ name: 'test' }), '%test%')
  })
  it('add wildcards to exact match pattern with whitespace', () => {
    assert.equal(toIlike({ name: '"test " ' }), '%"test " %')
  })
  it('match exactly', () => {
    assert.equal(toIlike({ name: '"test"' }), 'test')
  })
})

