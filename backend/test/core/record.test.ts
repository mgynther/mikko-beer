import { describe, it } from 'node:test'

import { contains } from '../../src/core/record'
import { assertDeepEqual } from '../assert'

describe('record', () => {
  const record: Record<string, string> = {
    key: 'value'
  }

  it('contains existing key', () => {
    assertDeepEqual(contains(record, 'key'), true)
  })

  it('does not contains missing key', () => {
    assertDeepEqual(contains(record, 'ke'), false)
  })
})

