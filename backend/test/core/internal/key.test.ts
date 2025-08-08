import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { areKeysEqual } from '../../../src/core/internal/key'

describe('key tests', () => {
  it('keys equal', () => {
    assert.equal(areKeysEqual(['a', 'b'], ['a', 'b']), true)
  })

  it('keys different', () => {
    assert.equal(areKeysEqual(['a', 'b'], ['a', 'c']), false)
  })

  it('key count different', () => {
    assert.equal(areKeysEqual(['a'], ['a', 'c']), false)
  })
})
