import { suite, test } from './test.js'
import * as assert from 'node:assert/strict'

import {
  assertDeepEqual,
  assertDoesNotThrow,
  assertEqual,
  assertGreaterThan,
  assertIncludes,
  assertInstanceOf,
  assertNotDeepEqual,
  assertNotEqual,
  assertRejects,
  assertThrows,
  assertTruthy,
} from './assert.js'
import { ControllerError } from '../src/logic/errors.js'

suite('assertion tests', () => {
  test('is deep equal', () => {
    assertDeepEqual({ prop: 'testing' }, { prop: 'testing' })
  })

  test('throws on failing deep equal', () => {
    assert.throws(() =>
      assertDeepEqual<Record<string, string>>(
        { prop: 'testing' },
        { property: 'another' },
      ),
    )
  })

  test('throws on deep equal with undefined against a missing property', () => {
    assert.throws(() =>
      assertDeepEqual<{ prop?: string | undefined }>({ prop: undefined }, {}),
    )
  })

  test('throws on deep equal with a class instance against a plain object', () => {
    class Value {
      prop = 'testing'
    }
    assert.throws(() => assertDeepEqual(new Value(), { prop: 'testing' }))
  })

  test('does not compile deep equal with an unknown property', () => {
    assert.throws(() =>
      // @ts-expect-error The value's type decides what may be expected.
      assertDeepEqual({ prop: 'testing' }, { prop: 'testing', another: 'a' }),
    )
  })

  test('is not deep equal', () => {
    assertNotDeepEqual<Record<string, string>>(
      { prop: 'testing' },
      { prop: 'testing', another: 'a' },
    )
  })

  test('throws on failing not deep equal', () => {
    assert.throws(() => assertNotDeepEqual([123, 'test'], [123, 'test']))
  })

  test('is equal', () => {
    assertEqual('testing', 'testing')
  })

  test('throws on failing equal', () => {
    assert.throws(() => assertEqual('one', 'another'))
  })

  test('is not equal', () => {
    assertNotEqual(1, 2)
  })

  test('throws on failing not equal', () => {
    assert.throws(() => assertNotEqual(123, 123))
  })

  test('is instance of', () => {
    assertInstanceOf(
      new ControllerError(400, 'UnknownError', 'This is an error', {
        info: 'some info here',
      }),
      ControllerError,
    )
  })

  test('is not instance of', () => {
    assert.throws(
      () => assertInstanceOf(new Error('unknown error'), ControllerError),
      /not a ControllerError instance/,
    )
  })

  test('is greater than', () => {
    assertGreaterThan(2, 1)
  })

  test('is not greater than', () => {
    assert.throws(
      () => assertGreaterThan(1, 2),
      /value 1 is not greater than 2/,
    )
  })

  test('includes', () => {
    assertIncludes('india pale ale', 'pale ale')
  })

  test('does not include', () => {
    assert.throws(
      () => assertIncludes('pale ale', 'india pale ale'),
      /value india pale ale is not included in pale ale/,
    )
  })
  ;['india pale ale', { prop: 'some value' }, ['array'], [], {}].forEach(
    (value) =>
      test(`'${value}' is truthy`, () => {
        assertTruthy(value)
      }),
  )
  ;['', undefined].forEach((value) =>
    test(`'${value}' is not truthy`, () => {
      assert.throws(() => assertTruthy(value))
    }),
  )

  class CustomError extends Error {
    constructor(message: string) {
      super(message)
    }
  }
  test('throws', () => {
    assertThrows(
      () => {
        throw new CustomError('test')
      },
      new CustomError('test'),
      CustomError,
    )
  })

  test('rejects', async () => {
    await assertRejects(
      async () => {
        throw new CustomError('test')
      },
      new CustomError('test'),
      CustomError,
    )
  })

  test('fails on throwing error of wrong type', () => {
    assert.throws(
      () =>
        assertThrows(
          () => {
            throw new Error('test')
          },
          new CustomError('test'),
          CustomError,
        ),
      /not a CustomError instance/,
    )
  })

  test('does not compile throws with an error of another class', () => {
    assert.throws(() =>
      assertThrows(
        () => {
          throw new ControllerError(400, 'UnknownError', 'test')
        },
        // @ts-expect-error The class decides what the error may be.
        new Error('test'),
        ControllerError,
      ),
    )
  })

  test('fails on throwing error with wrong message', () => {
    assert.throws(() =>
      assertThrows(
        () => {
          throw new CustomError('test')
        },
        new CustomError('another message'),
        CustomError,
      ),
    )
  })

  test('does not throw', () => {
    assertDoesNotThrow(() => 1 + 2)
  })

  test('fails on throwing when not supposed to', () => {
    assert.throws(
      () =>
        assertDoesNotThrow(() => {
          throw new Error('unexpected failure')
        }),
      /unexpected failure/,
    )
  })
})
