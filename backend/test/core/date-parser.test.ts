import { describe, it } from 'node:test'

import { parseDate } from '../../src/core/date-parser.js'
import { assertEqual, assertInstanceOf } from '../assert.js'

describe('date parser unit tests', () => {
  it('returns undefined with undefined', () => {
    assertEqual(parseDate(undefined), undefined)
  })

  it('returns undefined with an empty string', () => {
    assertEqual(parseDate(''), undefined)
  })

  it("returns undefined with the string 'invalid'", () => {
    assertEqual(parseDate('invalid'), undefined)
  })

  it('returns a Date with getTime matching the original timestamp', () => {
    const timestamp = 1665532800000
    const result = parseDate(`${timestamp}`)
    assertInstanceOf(result, Date)
    assertEqual(result?.getTime(), timestamp)
  })
})
