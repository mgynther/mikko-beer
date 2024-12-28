import { expect } from 'earl'

import { areKeysEqual } from '../../../src/core/internal/key'

describe('key tests', () => {
  it('keys equal', () => {
    expect(areKeysEqual(['a', 'b'], ['a', 'b'])).toEqual(true)
  })

  it('keys different', () => {
    expect(areKeysEqual(['a', 'b'], ['a', 'c'])).toEqual(false)
  })

  it('key count different', () => {
    expect(areKeysEqual(['a'], ['a', 'c'])).toEqual(false)
  })
})
