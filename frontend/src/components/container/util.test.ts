import { expect, test } from 'vitest'
import { isSizeValid } from './util'

[
  '0.10',
  '0.25',
  '0.33',
  '0.44',
  '0.50',
  '1.00',
].forEach((size: string) => {
  test(`container size "${size}" is valid`, () => {
    expect(isSizeValid(size)).toEqual(true)
  })
})
;

[
  '',
  'abc',
  '0.a3'
].forEach(size => {
  test(`container size "${size}" is invalid`, () => {
    expect(isSizeValid(size)).toEqual(false)
  })
})
