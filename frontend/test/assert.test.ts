import { expect } from 'vitest'
import { test } from './test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDeepEqual,
  assertDefined,
  assertEqual,
  assertGreaterThan,
  assertIncludes,
  assertInstanceOf,
  assertNotDeepEqual,
  assertNotEqual,
  assertThrows,
  assertThrowsWithMessage,
} from './assert'

// A mock as far as the call assertions read it, so that these tests do not
// depend on test/mock.ts working.
function called<A extends unknown[]>(...calls: A[]): { mock: { calls: A[] } } {
  return { mock: { calls } }
}

test('is equal', () => {
  assertEqual('testing', 'testing')
})

test('fails on unequal values', () => {
  expect(() => assertEqual('one', 'another')).toThrow()
})

test('fails on equal but different objects', () => {
  expect(() => assertEqual({ prop: 1 }, { prop: 1 })).toThrow()
})

test('is not equal', () => {
  assertNotEqual(1, 2)
})

test('fails on not equal with equal values', () => {
  expect(() => assertNotEqual(123, 123)).toThrow()
})

test('is deep equal', () => {
  assertDeepEqual({ prop: 'testing' }, { prop: 'testing' })
})

test('fails on deep equal with different values', () => {
  expect(() =>
    assertDeepEqual<Record<string, string>>(
      { prop: 'testing' },
      { property: 'another' },
    ),
  ).toThrow()
})

test('fails on deep equal with undefined against a missing property', () => {
  expect(() =>
    assertDeepEqual<{ prop?: string | undefined }>({ prop: undefined }, {}),
  ).toThrow()
})

test('fails on deep equal with a class instance against a plain object', () => {
  class Value {
    prop = 'testing'
  }
  expect(() => assertDeepEqual(new Value(), { prop: 'testing' })).toThrow()
})

test('is not deep equal', () => {
  assertNotDeepEqual<unknown[]>([123, 'test'], [123, 'another'])
})

test('fails on not deep equal with deep equal values', () => {
  expect(() => assertNotDeepEqual([123, 'test'], [123, 'test'])).toThrow()
})

test('is defined', () => {
  assertDefined('')
})

test('fails on defined with undefined', () => {
  expect(() => assertDefined(undefined)).toThrow()
})

test('is greater than', () => {
  assertGreaterThan(2, 1)
})

test('fails on greater than with an equal value', () => {
  expect(() => assertGreaterThan(1, 1)).toThrow()
})

test('includes', () => {
  assertIncludes('india pale ale', 'pale ale')
})

test('fails on includes with a longer string', () => {
  expect(() => assertIncludes('pale ale', 'india pale ale')).toThrow()
})

test('is instance of', () => {
  assertInstanceOf(new TypeError('type error'), Error)
})

test('fails on instance of with another class', () => {
  expect(() => assertInstanceOf(new Error('error'), TypeError)).toThrow()
})

test('throws', () => {
  assertThrows(() => {
    throw new Error('error')
  })
})

test('fails on throws when nothing is thrown', () => {
  expect(() => assertThrows(() => undefined)).toThrow()
})

test('throws with message', () => {
  assertThrowsWithMessage(() => {
    throw new Error('the whole message')
  }, 'the whole message')
})

test('fails on throws with message when nothing is thrown', () => {
  expect(() => assertThrowsWithMessage(() => undefined, 'message')).toThrow()
})

test('fails on throws with message when a non-error is thrown', () => {
  expect(() =>
    assertThrowsWithMessage(() => {
      throw 'message'
    }, 'message'),
  ).toThrow()
})

test('throws with part of the message', () => {
  assertThrowsWithMessage(() => {
    throw new Error('the whole message')
  }, 'whole')
})

test('fails on throws with message with another message', () => {
  expect(() =>
    assertThrowsWithMessage(() => {
      throw new Error('the whole message')
    }, 'another'),
  ).toThrow()
})

test('is called with', () => {
  assertCalledWith(called(['first'], ['second', 2]), ['second', 2])
})

test('fails on called with when no call matches', () => {
  expect(() =>
    assertCalledWith<unknown[]>(called(['first'], ['second']), ['third']),
  ).toThrow()
})

test('fails on called with with fewer arguments than called with', () => {
  expect(() =>
    assertCalledWith<unknown[]>(called(['first', 'second']), ['first']),
  ).toThrow()
})

test('fails on called with when never called', () => {
  expect(() => assertCalledWith<string[]>(called(), ['first'])).toThrow()
})

test('fails on called with with undefined against a missing property', () => {
  expect(() =>
    assertCalledWith<[{ prop?: string | undefined }]>(
      called([{ prop: undefined }]),
      [{}],
    ),
  ).toThrow()
})

test('is called', () => {
  assertCalled(called([]))
})

test('fails on called when never called', () => {
  expect(() => assertCalled(called())).toThrow()
})

test('has call count', () => {
  assertCallCount(called([], []), 2)
})

test('fails on call count with another count', () => {
  expect(() => assertCallCount(called([]), 0)).toThrow()
})
