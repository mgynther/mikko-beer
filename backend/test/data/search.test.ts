import { suite, test } from '../test.js'

import { toIlike } from '../../src/data/search.js'

import { assertEqual, assertThrows } from '../assert.js'

suite('search ilike unit tests', () => {
  test('add wildcards', () => {
    assertEqual(toIlike({ name: 'test' }), '%test%')
  })
  test('add wildcards to exact match pattern with whitespace', () => {
    assertEqual(toIlike({ name: '"test " ' }), '%"test " %')
  })
  test('match exactly', () => {
    assertEqual(toIlike({ name: '"test"' }), 'test')
  })
  test('throws on empty string', () => {
    assertThrows(
      () => toIlike({ name: '' }),
      new Error('must not search with missing or empty name'),
      Error,
    )
  })
})
