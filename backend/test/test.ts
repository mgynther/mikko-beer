import * as nodeTest from 'node:test'

// Wraps the test runner so that tests depend on this file rather than on
// node:test, and so that only what the tests use is available to them. A
// feature of the runner that tests start to need is added here on purpose,
// which keeps it visible. The types below are restated rather than taken
// from node:test for the same reason: the runner's types stay in this file.

type Hook = () => void | Promise<void>

// The mocks of node:test are returned as they are, and the compiler checks
// that they are what this type says, so the type is all there is to review.
//
// The arguments are never unless given, so an untyped mock can neither stand
// in for a function nor have its calls asserted: what it is called with is
// checked against what the test expects. A mock without an implementation
// returns undefined, so it stands in only for a function returning void or
// undefined, and anything else it stands in for gets an implementation that
// returns what the type promises.
type MockFunction<A extends unknown[] = never, R = undefined> = ((
  ...args: A
) => R) & {
  mock: {
    callCount: () => number
    calls: readonly { arguments: A }[]
  }
}

interface TestContext {
  mock: {
    fn: {
      <A extends unknown[] = never>(): MockFunction<A>
      <A extends unknown[], R>(
        implementation: (...args: A) => R,
      ): MockFunction<A, R>
    }
  }
}

export function suite(name: string, fn: () => void): void {
  nodeTest.describe(name, fn)
}

export function test(
  name: string,
  fn: (context: TestContext) => void | Promise<void>,
): void {
  nodeTest.it(name, (context) => {
    function mockFunction<A extends unknown[] = never>(): MockFunction<A>
    function mockFunction<A extends unknown[], R>(
      implementation: (...args: A) => R,
    ): MockFunction<A, R>
    function mockFunction<A extends unknown[], R>(
      implementation?: (...args: A) => R,
    ): MockFunction<A, R> {
      return context.mock.fn(implementation)
    }
    return fn({ mock: { fn: mockFunction } })
  })
}

export function before(fn: Hook): void {
  nodeTest.before(fn)
}

export function beforeEach(fn: Hook): void {
  nodeTest.beforeEach(fn)
}

export function after(fn: Hook): void {
  nodeTest.after(fn)
}

export function afterEach(fn: Hook): void {
  nodeTest.afterEach(fn)
}
