import { describe, it } from 'node:test'

import { contains } from '../../src/core/record.js'
import { assertEqual } from '../assert.js'

describe('record', () => {
  const record: Record<string, string> = {
    key: 'value'
  }

  it('contains existing key', () => {
    assertEqual(contains(record, 'key'), true)
  })

  it('does not contains missing key', () => {
    assertEqual(contains(record, 'ke'), false)
  })
})

