import * as assert from 'node:assert/strict'

// Provides better type safety than assert.deepEqual where we know types
// already match. Finding errors coding time vs run time is quicker.
export function assertDeepEqual<T>(value: T, reference: T): void {
  assert.deepEqual(value, reference)
}

// Provides type where we know types already match. Finding errors coding time
// vs run time is quicker.
export function assertNotDeepEqual<T>(value: T, reference: T): void {
  assert.notDeepEqual(value, reference)
}

// Provides better type safety than assert.equal where we know types already
// match. Finding errors coding time vs run time is quicker.
export function assertEqual<T>(value: T, reference: T): void {
  assert.equal(value, reference)
}

export function assertGreaterThan(value: number, reference: number): void {
  assert.equal(
    value > reference,
    true,
    `value ${value} is not greater than ${reference}`
  )
}

export function assertIncludes(
  fullString: string,
  includedString: string
): void {
  assert.equal(
    fullString.includes(includedString),
    true,
    `value ${includedString} is not included in ${fullString}`
  )
}

type Class<T> = new (...args: any[]) => T
// Does not catch classes of wrong type compile time but at least provides a way
// to have generic class type.
export function assertInstanceOf<T>(instance: T, classType: Class<T>) {
  assert.equal(
    instance instanceof classType,
    true,
    `not a ${classType.name} instance`
  )
}

export function assertTruthy(value: object | undefined | string) {
  assert.ok(value)
}
