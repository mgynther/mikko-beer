import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { assertGreaterThan, assertIncludes } from './assert'

describe('assertion tests', () => {
  it('is greater than', () => {
    assertGreaterThan(2, 1)
  })

  it('is not greater than', () => {
    assert.throws(() =>
      assertGreaterThan(1, 2), /value 1 is not greater than 2/
    )
  })

  it('includes', () => {
    assertIncludes('india pale ale', 'pale ale')
  })

  it('does not include', () => {
    assert.throws(() =>
      assertIncludes('pale ale', 'india pale ale'),
      /value india pale ale is not included in pale ale/
    )
  })
})
