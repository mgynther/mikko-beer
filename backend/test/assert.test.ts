import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import {
  assertDeepEqual,
  assertGreaterThan,
  assertIncludes,
  assertInstanceOf,
  assertNotDeepEqual,
  assertTruthy
} from './assert'
import { ControllerError } from '../src/core/errors'

describe('assertion tests', () => {
  it('is deep equal', () => {
    assertDeepEqual({ prop: 'testing' }, { prop: 'testing' })
  })

  it('throws on failing deep equal', () => {
    assert.throws(() =>
      assertDeepEqual({ prop: 'testing' }, { property: 'another' })
    )
  })

  it('is not deep equal', () => {
    assertNotDeepEqual({ prop: 'testing' }, { prop: 'testing', another: 'a' })
  })

  it('throws on failing not deep equal', () => {
    assert.throws(() =>
      assertNotDeepEqual([123, 'test'], [123, 'test'])
    )
  })

  it('is instance of', () => {
    assertInstanceOf(
      new ControllerError(
        400,
        'UnknownError',
        'This is an error',
        { info: 'some info here' }
      ),
      ControllerError
    )
  })

  it('is not instance of', () => {
    assert.throws(() =>
      assertInstanceOf(new Error('unknown error'), ControllerError),
      /not a ControllerError instance/
    )
  })

  it('is greater than', () => {
    assertGreaterThan(2, 1)
  })

  it('is not greater than', () => {
    assert.throws(() =>
      assertGreaterThan(1, 2), /value 1 is not greater than 2/
    )
  })

  it('includes', () => {
    assertIncludes('india pale ale', 'pale ale')
  })

  it('does not include', () => {
    assert.throws(() =>
      assertIncludes('pale ale', 'india pale ale'),
      /value india pale ale is not included in pale ale/
    )
  })
  ;

  [
    'india pale ale',
    { prop: 'some value' },
    [ 'array' ],
    [],
    {}
  ].forEach(value =>
    it(`'${value}' is truthy`, () => {
      assertTruthy(value)
    })
  )
  ;

  [
    '',
    undefined
  ].forEach(value =>
    it(`'${value}' is not truthy`, () => {
      assert.throws(() =>
        assertTruthy(value)
      )
    })
  )
})
