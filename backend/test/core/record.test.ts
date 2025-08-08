import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { contains } from '../../src/core/record'

describe('record', () => {
  const record: Record<string, string> = {
    key: 'value'
  }

  it('contains existing key', () => {
    assert.deepEqual(contains(record, 'key'), true)
  })

  it('does not contains missing key', () => {
    assert.deepEqual(contains(record, 'ke'), false)
  })
})

