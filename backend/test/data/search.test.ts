import { describe, it } from 'node:test'

import { toIlike } from '../../src/data/search.js'

import { assertEqual, assertThrows } from '../assert.js'

describe('search ilike unit tests', () => {
  it('add wildcards', () => {
    assertEqual(toIlike({ name: 'test' }), '%test%')
  })
  it('add wildcards to exact match pattern with whitespace', () => {
    assertEqual(toIlike({ name: '"test " ' }), '%"test " %')
  })
  it('match exactly', () => {
    assertEqual(toIlike({ name: '"test"' }), 'test')
  })
  it('throws on empty string', () => {
    assertThrows(
      () => toIlike({ name: '' }),
      new Error('must not search with missing or empty name'),
      Error,
    )
  })
})
