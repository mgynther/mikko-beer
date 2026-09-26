import { expect, test, vitest } from 'vitest'
import type { Console } from './dont-call'
import { dontCall, dontCallWithConsole } from './dont-call'

test('dontCall throws', () => {
  expect(() => dontCall()).toThrow()
})

test('dontCallWithConsole throws and logs', () => {
  const error = vitest.fn()
  const console: Console = {
    error,
  }
  const expected = new Error('must not be called')
  expect(() => dontCallWithConsole(console)).toThrow(expected)
  expect(console.error).toHaveBeenCalledTimes(1)
  const calls = error.mock.calls
  expect(calls[0][0]).toEqual('must not be called, see stack')
  const stack = calls[0][1]
  expect(stack).toContain('Error')
  expect(stack).toContain('at dontCallWithConsole')
  expect(stack).toContain('dont-call.ts')
})
