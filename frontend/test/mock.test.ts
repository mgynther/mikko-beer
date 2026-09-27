import { test } from './test'
import { assertDeepEqual, assertEqual } from './assert'
import { mockFunction } from './mock'

test('records the arguments of every call', () => {
  const mocked = mockFunction()
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
  const mocked = mockFunction()
  assertEqual(mocked(), undefined)
})

test('forgets its calls when cleared', () => {
  const mocked = mockFunction()
  mocked('first')
  mocked.mockClear()
  assertDeepEqual(mocked.mock.calls, [])
})
