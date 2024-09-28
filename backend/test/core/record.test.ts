import { expect } from 'earl'

import { contains } from '../../src/core/record'

describe('record', () => {
  const record: Record<string, string> = {
    key: 'value'
  }

  it('contains existing key', () => {
    expect(contains(record, 'key')).toEqual(true)
  })

  it('does not contains missing key', () => {
    expect(contains(record, 'ke')).toEqual(false)
  })
})

