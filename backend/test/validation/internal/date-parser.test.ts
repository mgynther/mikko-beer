import { suite, test } from '../../test.js'

import { parseDate } from '../../../src/validation/internal/date-parser.js'
import { assertEqual, assertInstanceOf } from '../../assert.js'

suite('validation date parser unit tests', () => {
  test('returns undefined with undefined', () => {
    assertEqual(parseDate(undefined), undefined)
  })

  test('returns undefined with an empty string', () => {
    assertEqual(parseDate(''), undefined)
  })

  test("returns undefined with the string 'invalid'", () => {
    assertEqual(parseDate('invalid'), undefined)
  })

  test('returns a Date with getTime matching the original timestamp', () => {
    const timestamp = 1665532800000
    const result = parseDate(`${timestamp}`)
    assertInstanceOf(result, Date)
    assertEqual(result?.getTime(), timestamp)
  })
})
