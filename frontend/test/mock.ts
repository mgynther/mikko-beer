import { vitest } from 'vitest'

// Wraps the mock functions of vitest so that tests depend on this file rather
// than on vitest, and so that only what the tests use of a mock is available
// to them. The type is restated rather than taken from vitest for the same
// reason: a feature of the mock that tests start to need is added here.

// The arguments and the return are any for a mock created without an
// implementation: it stands in for functions of every signature, the way
// vitest.fn() does.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

export type MockFunction<A extends unknown[] = Any[], R = Any> = ((
  ...args: A
) => R) & {
  mock: {
    calls: A[]
  }
  mockClear: () => void
}

export function mockFunction<A extends unknown[] = Any[], R = Any>(
  implementation?: (...args: A) => R,
): MockFunction<A, R> {
  return vitest.fn(implementation)
}
