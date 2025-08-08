import * as assert from 'node:assert/strict'

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
