import * as assert from 'node:assert/strict'

// Provides better type safety than assert.deepEqual where we know types
// already match. Finding errors coding time vs run time is quicker.
export function assertDeepEqual<T>(value: T, reference: T): void {
  assert.deepEqual(value, reference)
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
