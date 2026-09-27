import { vitest } from 'vitest'

// Wraps the mock functions of vitest so that tests depend on this file rather
// than on vitest, and so that only what the tests use of a mock is available
// to them. The type is restated rather than taken from vitest for the same
// reason: a feature of the mock that tests start to need is added here.

// The arguments are never unless given, so an untyped mock can neither stand
// in for a function nor have its calls asserted: what it is called with is
// checked against what the test expects. A mock without an implementation
// returns undefined, so it stands in only for a function returning void or
// undefined, and anything else it stands in for gets an implementation that
// returns what the type promises.

// The implementation is NoInfer, so the types come from the type parameters
// alone and the implementation is only the behaviour: an implementation cannot
// type the mock through parameters that exist to carry a type, and one whose
// type differs from what the test names fails to compile.
export type MockFunction<A extends unknown[] = never, R = undefined> = ((
  ...args: A
) => R) & {
  mock: {
    calls: A[]
  }
  mockClear: () => void
}

export function mockFunction<A extends unknown[] = never>(): MockFunction<A>
export function mockFunction<A extends unknown[] = never, R = undefined>(
  implementation: NoInfer<(...args: A) => R>,
): MockFunction<A, R>
export function mockFunction<A extends unknown[], R>(
  implementation?: (...args: A) => R,
): MockFunction<A, R> {
  return vitest.fn(implementation)
}
