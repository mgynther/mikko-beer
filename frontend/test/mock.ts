import { vitest } from 'vitest'

// Wraps the mock functions of vitest so that tests depend on this file rather
// than on vitest, and so that only what the tests use of a mock is available
// to them. The type is restated rather than taken from vitest for the same
// reason: a feature of the mock that tests start to need is added here.

// A mock without an implementation returns undefined, typed any so that it
// can stand in for a function returning anything. Give it an implementation
// when what it returns matters to the test.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

// The arguments are never unless given, so an untyped mock can neither stand
// in for a function nor have its calls asserted: what it is called with is
// checked against what the test expects.
export type MockFunction<A extends unknown[] = never, R = Any> = ((
  ...args: A
) => R) & {
  mock: {
    calls: A[]
  }
  mockClear: () => void
}

export function mockFunction<A extends unknown[] = never>(): MockFunction<A>
export function mockFunction<A extends unknown[], R>(
  implementation: (...args: A) => R,
): MockFunction<A, R>
export function mockFunction<A extends unknown[], R>(
  implementation?: (...args: A) => R,
): MockFunction<A, R> {
  return vitest.fn(implementation)
}
