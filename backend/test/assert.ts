import * as assert from 'node:assert/strict'

// The expected value is NoInfer so that the value alone decides the type: a
// test comparing values of two different types fails to compile rather than
// widening the type to fit both, and an expected object literal is checked for
// properties the value's type does not have.

// Strict, so a property that is undefined is not the same as a property that
// is missing, and a class instance is not the same as a plain object.
export function assertDeepEqual<T>(value: T, expected: NoInfer<T>): void {
  assert.deepEqual(value, expected)
}

export function assertNotDeepEqual<T>(value: T, expected: NoInfer<T>): void {
  assert.notDeepEqual(value, expected)
}

export function assertEqual<T>(value: T, expected: NoInfer<T>): void {
  assert.equal(value, expected)
}

export function assertNotEqual<T>(value: T, expected: NoInfer<T>): void {
  assert.notEqual(value, expected)
}

export function assertGreaterThan(value: number, reference: number): void {
  assert.equal(
    value > reference,
    true,
    `value ${value} is not greater than ${reference}`,
  )
}

export function assertIncludes(
  fullString: string,
  includedString: string,
): void {
  assert.equal(
    fullString.includes(includedString),
    true,
    `value ${includedString} is not included in ${fullString}`,
  )
}

type Class<T> = new (...args: never[]) => T
// Does not catch classes of wrong type compile time but at least provides a way
// to have generic class type.
export function assertInstanceOf<T>(
  instance: unknown,
  classType: Class<T>,
): asserts instance is T {
  assert.equal(
    instance instanceof classType,
    true,
    `not a ${classType.name} instance`,
  )
}

export function assertThrows<T extends Error>(
  func: () => void,
  error: NoInfer<T>,
  classType: Class<T>,
): void {
  assert.throws(func, (err: unknown) => {
    assertInstanceOf(err, classType)
    assert.deepEqual(err, error)
    return true
  })
}

export async function assertRejects<T extends Error>(
  func: () => Promise<void>,
  error: NoInfer<T>,
  classType: Class<T>,
): Promise<void> {
  await assert.rejects(func, (err: unknown) => {
    assertInstanceOf(err, classType)
    assert.deepEqual(err, error)
    return true
  })
}

export function assertDoesNotThrow(func: () => void): void {
  assert.doesNotThrow(func)
}

export function assertTruthy(value: object | undefined | string): void {
  assert.ok(value)
}

// For rejections where the error is not ours to construct, such as a database
// constraint violation. Matching the message keeps the test independent of the
// driver's error class and its many properties.
export async function assertRejectsWithMessage(
  func: () => Promise<unknown>,
  includedMessage: string,
): Promise<void> {
  await assert.rejects(func, (err: unknown) => {
    assert.ok(err instanceof Error)
    assertIncludes(err.message, includedMessage)
    return true
  })
}
