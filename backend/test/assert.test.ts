import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import {
  assertDeepEqual,
  assertDoesNotThrow,
  assertGreaterThan,
  assertIncludes,
  assertInstanceOf,
  assertNotDeepEqual,
  assertThrows,
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

  class CustomError extends Error {
    constructor(message: string) {
      super(message)
    }
  }
  it('throws', () => {
    assertThrows(
      () => { throw new CustomError('test') },
      new CustomError('test'),
      CustomError
    )
  })

  it('fails on throwing error of wrong type', () => {
    assert.throws(() =>
      assertThrows(
        () => { throw new Error('test') },
        new CustomError('test'),
        CustomError
      ),
      /not a CustomError instance/
    )
  })

  it('fails on throwing error with wrong message', () => {
    assert.throws(() =>
      assertThrows(
        () => { throw new CustomError('test') },
        new CustomError('another message'),
        CustomError
      )
    )
  })

  it('does not throw', () => {
    assertDoesNotThrow(() => 1 + 2)
  })

  it('fails on throwing when not supposed to', () => {
    assert.throws(() =>
      assertDoesNotThrow(() => { throw new Error('unexpected failure') }),
      /unexpected failure/
    )
  })
})
