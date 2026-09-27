import { test } from './test'
import {
  assertCallCount,
  assertEqual,
  assertIncludes,
  assertThrows,
  assertThrowsWithMessage,
} from './assert'
import { mockFunction } from './mock'
import type { Console } from './dont-call'
import { dontCall, dontCallWithConsole } from './dont-call'

test('dontCall throws', () => {
  assertThrows(() => dontCall())
})

test('dontCallWithConsole throws and logs', () => {
  const error = mockFunction()
  const console: Console = {
    error,
  }
  assertThrowsWithMessage(
    () => dontCallWithConsole(console),
    'must not be called',
  )
  assertCallCount(error, 1)
  const calls = error.mock.calls
  assertEqual(calls[0][0], 'must not be called, see stack')
  const stack = calls[0][1]
  assertIncludes(stack, 'Error')
  assertIncludes(stack, 'at dontCallWithConsole')
  assertIncludes(stack, 'dont-call.ts')
})
