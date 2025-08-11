import { describe, it } from 'node:test'

import { areKeysEqual } from '../../../src/core/internal/key'
import { assertEqual } from '../../assert'

describe('key tests', () => {
  it('keys equal', () => {
    assertEqual(areKeysEqual(['a', 'b'], ['a', 'b']), true)
  })

  it('keys different', () => {
    assertEqual(areKeysEqual(['a', 'b'], ['a', 'c']), false)
  })

  it('key count different', () => {
    assertEqual(areKeysEqual(['a'], ['a', 'c']), false)
  })
})
