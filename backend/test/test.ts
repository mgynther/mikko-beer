import * as nodeTest from 'node:test'

// Wraps the test runner so that tests depend on this file rather than on
// node:test, and so that only what the tests use is available to them. A
// feature of the runner that tests start to need is added here on purpose,
// which keeps it visible. The types are restated rather than taken from
// node:test for the same reason: the runner's types stay in this file. Mock
// functions are in test/mock.ts.

type Hook = () => void | Promise<void>

export function suite(name: string, fn: () => void): void {
  nodeTest.describe(name, fn)
}

export function test(name: string, fn: () => void | Promise<void>): void {
  nodeTest.it(name, fn)
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
