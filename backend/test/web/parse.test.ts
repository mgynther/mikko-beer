import { describe, it } from 'node:test'

import { parseExpiryDurationMin } from '../../src/web/parse'
import { assertEqual, assertThrows } from '../assert';

describe('parse expiry duration min', () => {
  it('parses valid number', () => {
    assertEqual(parseExpiryDurationMin('12'), 12)
  })
  ;

  [
    'i12',
    '12.0',
    '12.',
    '',
  ].forEach((value: string) => {
    it(`throws on invalid value "${value}"`, () => {
      assertThrows(
        () => parseExpiryDurationMin(value),
        new Error(`invalid expiry duration ${value}`),
        Error
      )
    })
  })
})
