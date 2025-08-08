import { expect } from 'earl'

import { parseExpiryDurationMin } from '../../src/web/parse'

describe('parse expiry duration min', () => {
  it('parses valid number', () => {
    expect(parseExpiryDurationMin('12')).toEqual(12)
  })
  ;

  [
    'i12',
    '12.0',
    '12.',
    '',
  ].forEach((value: string) => {
    it(`throws on invalid value "${value}"`, () => {
      expect(() => parseExpiryDurationMin(value))
      .toThrow(`invalid expiry duration ${value}`)
    })
  })
})
