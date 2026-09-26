import { suite, test } from '../test.js'

import { toRowNumbers } from '../../src/data/pagination.js'

import { assertDeepEqual } from '../assert.js'

suite('toRowNumbers unit tests', () => {
  test('toRowNumbers', () => {
    const result = toRowNumbers({ size: 14, skip: 4 })
    assertDeepEqual(result, { start: 5, end: 18 })
  })
})
