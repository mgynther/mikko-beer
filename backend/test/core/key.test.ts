import { expect } from 'chai'

import { areKeysEqual } from '../../src/core/key'

describe('key tests', () => {
  it('keys equal', () => {
    expect(areKeysEqual(['a', 'b'], ['a', 'b'])).to.equal(true)
  })

  it('keys different', () => {
    expect(areKeysEqual(['a', 'b'], ['a', 'c'])).to.equal(false)
  })

  it('key count different', () => {
    expect(areKeysEqual(['a'], ['a', 'c'])).to.equal(false)
  })
})
