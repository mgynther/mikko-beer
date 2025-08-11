import { describe, it } from 'node:test'

import { contains } from '../../src/core/record'
import { assertEqual } from '../assert'

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

