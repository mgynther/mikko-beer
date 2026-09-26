import { suite, test } from '../test.js'

import { parseExpiryDurationMin } from '../../src/web/parse.js'
import { assertEqual, assertThrows } from '../assert.js'

suite('parse expiry duration min', () => {
  test('parses valid number', () => {
    assertEqual(parseExpiryDurationMin('12'), 12)
  })
  ;['i12', '12.0', '12.', ''].forEach((value: string) => {
    test(`throws on invalid value "${value}"`, () => {
      assertThrows(
        () => parseExpiryDurationMin(value),
        new Error(`invalid expiry duration ${value}`),
        Error,
      )
    })
  })
})
