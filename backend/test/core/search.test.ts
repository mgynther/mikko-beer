import { expect } from 'earl'

import {
  type SearchByName,
  toIlike,
  validateSearchByName
} from '../../src/core/search'

import { invalidSearchError } from '../../src/core/errors'
import { expectThrow } from './controller-error-helper'

describe('search validation unit tests', () => {
  function pass(input: unknown, output: SearchByName) {
    expect(validateSearchByName(input)).toEqual(output)
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
    expect(toIlike({ name: 'test' })).toEqual('%test%')
  })
  it('add wildcards to exact match pattern with whitespace', () => {
    expect(toIlike({ name: '"test " ' })).toEqual('%"test " %')
  })
  it('match exactly', () => {
    expect(toIlike({ name: '"test"' })).toEqual('test')
  })
})

