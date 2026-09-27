import { test } from './test.js'
import { assertDeepEqual, assertEqual } from './assert.js'
import { mockFunction } from './mock.js'

test('records the arguments of every call', () => {
  const mocked = mockFunction<[text: string, count?: number]>()
  mocked('first')
  mocked('second', 2)
  assertDeepEqual(
    mocked.mock.calls.map((call) => call.arguments),
    [['first'], ['second', 2]],
  )
})

test('counts its calls', () => {
  const mocked = mockFunction<[]>()
  mocked()
  mocked()
  assertEqual(mocked.mock.callCount(), 2)
})

test('returns what the implementation returns', () => {
  const mocked = mockFunction((value: number): number => value * 2)
  assertEqual(mocked(2), 4)
  assertDeepEqual(mocked.mock.calls[0].arguments, [2])
})

test('returns undefined without an implementation', () => {
  const mocked = mockFunction<[]>()
  assertEqual(mocked(), undefined)
})

test('cannot be called without its arguments being typed', () => {
  const mocked = mockFunction()
  // @ts-expect-error The arguments are never until the test says what they are.
  mocked('first')
  assertEqual(mocked.mock.callCount(), 1)
})

test('without an implementation stands in only for void', () => {
  // @ts-expect-error A mock without an implementation returns undefined.
  const load: () => Promise<void> = mockFunction<[]>()
  assertEqual(typeof load, 'function')
})
