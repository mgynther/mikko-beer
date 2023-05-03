import { expect } from 'chai'

import { ControllerError } from '../../src/util/errors'

import {
  type SearchByName,
  toIlike,
  validateSearchByName
} from '../../src/util/search'

describe('search validation unit tests', () => {
  function pass(input: unknown, output: SearchByName) {
    expect(validateSearchByName(input)).to.eql(output)
  }
  function fail(input: unknown) {
    expect(() => (validateSearchByName(input))).to.throw(ControllerError)
  }
  it('should pass validation', () => {
    pass({ name: 'testing' }, { name: 'testing' })
  })
  it('should fail with empty name', () => {
    fail({ name: '' })
  })
  it('should fail with missing name', () => {
    fail({})
  })
  it('should fail with additional property', () => {
    fail({ name: 'testing', something: 123 })
  })
  it('should fail with wrong type', () => {
    fail({ name: 123 })
  })
})

describe('search ilike unit tests', () => {
  it('should add wildcards', () => {
    expect(toIlike({ name: 'test' })).to.equal('%test%')
  })
  it('should add wildcards to exact match pattern with whitespace', () => {
    expect(toIlike({ name: '"test " ' })).to.equal('%"test " %')
  })
  it('should match exactly', () => {
    expect(toIlike({ name: '"test"' })).to.equal('test')
  })
})

