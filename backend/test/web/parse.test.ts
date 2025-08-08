import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { parseExpiryDurationMin } from '../../src/web/parse'

describe('parse expiry duration min', () => {
  it('parses valid number', () => {
    assert.equal(parseExpiryDurationMin('12'), 12)
  })
  ;

  [
    'i12',
    '12.0',
    '12.',
    '',
  ].forEach((value: string) => {
    it(`throws on invalid value "${value}"`, () => {
      assert.throws(
        () => parseExpiryDurationMin(value),
        new Error(`invalid expiry duration ${value}`)
      )
    })
  })
})
