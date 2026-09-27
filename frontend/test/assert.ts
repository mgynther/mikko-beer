import { expect } from 'vitest'

// Wraps the assertions of vitest so that tests depend on this file rather than
// on vitest, and so that only what the tests use is available to them. Each
// assertion takes the value first and what it is expected to be second.
//
// The expected value is NoInfer so that the value alone decides the type: a
// test comparing values of two different types fails to compile rather than
// widening the type to fit both, and an expected object literal is checked for
// properties the value's type does not have.

export function assertEqual<T>(value: T, expected: NoInfer<T>): void {
  expect(value).toBe(expected)
}

export function assertNotEqual<T>(value: T, expected: NoInfer<T>): void {
  expect(value).not.toBe(expected)
}

// Strict, so a property that is undefined is not the same as a property that
// is missing, and a class instance is not the same as a plain object.
export function assertDeepEqual<T>(value: T, expected: NoInfer<T>): void {
  expect(value).toStrictEqual(expected)
}

export function assertNotDeepEqual<T>(value: T, expected: NoInfer<T>): void {
  expect(value).not.toStrictEqual(expected)
}

export function assertDefined<T>(value: T | undefined): asserts value is T {
  expect(value).toBeDefined()
}

export function assertGreaterThan(value: number, reference: number): void {
  expect(value).toBeGreaterThan(reference)
}

export function assertIncludes(
  fullString: string,
  includedString: string,
): void {
  expect(fullString).toContain(includedString)
}

type Class<T> = new (...args: never[]) => T

export function assertInstanceOf<T>(
  instance: unknown,
  classType: Class<T>,
): asserts instance is T {
  expect(instance).toBeInstanceOf(classType)
}

export function assertThrows(func: () => unknown): void {
  expect(func).toThrow()
}

// Matching part of the message keeps the test independent of details the
// thrower adds to it, such as what a validator found wrong.
export function assertThrowsWithMessage(
  func: () => unknown,
  includedMessage: string,
): void {
  let thrown: unknown = undefined
  try {
    func()
  } catch (error) {
    thrown = error
  }
  assertInstanceOf(thrown, Error)
  expect(thrown.message).toContain(includedMessage)
}

// The mocks of test/mock.ts, described only as far as the call assertions
// read them, so that asserting does not depend on how a mock is made.
interface Mocked<A extends unknown[]> {
  mock: {
    calls: A[]
  }
}

function isStrictEqual(value: unknown, expected: unknown): boolean {
  try {
    expect(value).toStrictEqual(expected)
    return true
  } catch {
    return false
  }
}

// At least one call had exactly these arguments, compared the same way as
// assertDeepEqual compares.
export function assertCalledWith<A extends unknown[]>(
  mocked: Mocked<A>,
  args: NoInfer<A>,
): void {
  const calls = mocked.mock.calls
  if (calls.some((call) => isStrictEqual(call, args))) {
    return
  }
  // No call matched, so this fails, and its diff shows the calls there were.
  expect(calls, 'no call had the expected arguments').toStrictEqual([args])
}

export function assertCalled<A extends unknown[]>(mocked: Mocked<A>): void {
  expect(
    mocked.mock.calls.length,
    'expected at least one call',
  ).toBeGreaterThan(0)
}

export function assertCallCount<A extends unknown[]>(
  mocked: Mocked<A>,
  count: number,
): void {
  expect(mocked.mock.calls.length, 'number of calls').toBe(count)
}
