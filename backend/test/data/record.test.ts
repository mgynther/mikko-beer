import { suite, test } from '../test.js'

import { contains } from '../../src/data/record.js'
import { assertEqual } from '../assert.js'

suite('record', () => {
  const record: Record<string, string> = {
    key: 'value',
  }

  test('contains existing key', () => {
    assertEqual(contains(record, 'key'), true)
  })

  test('does not contains missing key', () => {
    assertEqual(contains(record, 'ke'), false)
  })
})
