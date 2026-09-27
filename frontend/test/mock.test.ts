import { test } from './test'
import { assertDeepEqual, assertEqual } from './assert'
import { mockFunction } from './mock'

test('records the arguments of every call', () => {
  const mocked = mockFunction<[text: string, count?: number]>()
  mocked('first')
  mocked('second', 2)
  assertDeepEqual(mocked.mock.calls, [['first'], ['second', 2]])
})

test('returns what the implementation returns', () => {
  const mocked = mockFunction((value: number): number => value * 2)
  assertEqual(mocked(2), 4)
  assertDeepEqual(mocked.mock.calls, [[2]])
})

test('returns undefined without an implementation', () => {
  const mocked = mockFunction<[]>()
  assertEqual(mocked(), undefined)
})

test('forgets its calls when cleared', () => {
  const mocked = mockFunction<[text: string]>()
  mocked('first')
  mocked.mockClear()
  assertDeepEqual(mocked.mock.calls, [])
})

test('cannot be called without its arguments being typed', () => {
  const mocked = mockFunction()
  // @ts-expect-error The arguments are never until the test says what they are.
  mocked('first')
  assertEqual(mocked.mock.calls.length, 1)
})

test('without an implementation stands in only for void functions', () => {
  // @ts-expect-error A mock without an implementation returns undefined.
  const load: () => Promise<void> = mockFunction<[]>()
  assertEqual(typeof load, 'function')
})
