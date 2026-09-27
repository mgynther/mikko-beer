import * as vitest from 'vitest'

// Wraps the test runner so that tests depend on this file rather than on
// vitest, and so that only what the tests use is available to them. A feature
// of the runner that tests start to need is added here on purpose, which
// keeps it visible. Names are required and options are not supported.

type Hook = () => void | Promise<void>

export function test(name: string, fn: () => void | Promise<void>): void {
  vitest.test(name, fn)
}

export function beforeAll(fn: Hook): void {
  vitest.beforeAll(fn)
}

export function beforeEach(fn: Hook): void {
  vitest.beforeEach(fn)
}

export function afterAll(fn: Hook): void {
  vitest.afterAll(fn)
}

export function afterEach(fn: Hook): void {
  vitest.afterEach(fn)
}
