import { test } from './test.js'
import { assertDeepEqual, assertEqual } from './assert.js'

test('mock records the arguments of every call', (t) => {
  const mocked = t.mock.fn<[text: string, count?: number]>()
  mocked('first')
  mocked('second', 2)
  assertDeepEqual(
    mocked.mock.calls.map((call) => call.arguments),
    [['first'], ['second', 2]],
  )
})

test('mock counts its calls', (t) => {
  const mocked = t.mock.fn<[]>()
  mocked()
  mocked()
  assertEqual(mocked.mock.callCount(), 2)
})

test('mock returns what the implementation returns', (t) => {
  const mocked = t.mock.fn((value: number): number => value * 2)
  assertEqual(mocked(2), 4)
  assertDeepEqual(mocked.mock.calls[0].arguments, [2])
})

test('mock returns undefined without an implementation', (t) => {
  const mocked = t.mock.fn<[]>()
  assertEqual(mocked(), undefined)
})

test('mock cannot be called without its arguments being typed', (t) => {
  const mocked = t.mock.fn()
  // @ts-expect-error The arguments are never until the test says what they are.
  mocked('first')
  assertEqual(mocked.mock.callCount(), 1)
})

test('mock without an implementation stands in only for void', (t) => {
  // @ts-expect-error A mock without an implementation returns undefined.
  const load: () => Promise<void> = t.mock.fn<[]>()
  assertEqual(typeof load, 'function')
})
