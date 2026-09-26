import { suite, test } from '../../test.js'

import { areKeysEqual } from '../../../src/logic/internal/key.js'
import { assertEqual } from '../../assert.js'

suite('key tests', () => {
  test('keys equal', () => {
    assertEqual(areKeysEqual(['a', 'b'], ['a', 'b']), true)
  })

  test('keys different', () => {
    assertEqual(areKeysEqual(['a', 'b'], ['a', 'c']), false)
  })

  test('key count different', () => {
    assertEqual(areKeysEqual(['a'], ['a', 'c']), false)
  })
})
