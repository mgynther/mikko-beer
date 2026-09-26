import * as nodeTest from 'node:test'

// Wraps the test runner so that tests depend on this file rather than on
// node:test, and so that only what the tests use is available to them. A
// feature of the runner that tests start to need is added here on purpose,
// which keeps it visible. The types below are restated rather than taken
// from node:test for the same reason: the runner's types stay in this file.

type Hook = () => void | Promise<void>

// A call through the mocked F returns what its constraint returns, so only
// an any return lets the call be typed as ReturnType<F>.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Implementation = (...args: never[]) => any

interface MockFunctionCall {
  arguments: unknown[]
}

type MockFunction<F extends Implementation> = ((
  ...args: Parameters<F>
) => ReturnType<F>) & {
  mock: {
    callCount: () => number
    calls: MockFunctionCall[]
  }
}

interface TestContext {
  mock: {
    fn: <F extends Implementation>(implementation: F) => MockFunction<F>
  }
}

function mockFunction<F extends Implementation>(
  context: nodeTest.TestContext,
  implementation: F,
): MockFunction<F> {
  const mocked = context.mock.fn(implementation)
  const call = (...args: Parameters<F>): ReturnType<F> => mocked(...args)
  return Object.assign(call, {
    mock: {
      callCount: (): number => mocked.mock.callCount(),
      get calls(): MockFunctionCall[] {
        return mocked.mock.calls.map((mockedCall) => ({
          arguments: mockedCall.arguments,
        }))
      },
    },
  })
}

export function suite(name: string, fn: () => void): void {
  nodeTest.describe(name, fn)
}

export function test(
  name: string,
  fn: (context: TestContext) => void | Promise<void>,
): void {
  nodeTest.it(name, (context) =>
    fn({
      mock: {
        fn: (implementation) => mockFunction(context, implementation),
      },
    }),
  )
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
