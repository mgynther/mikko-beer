import { describe, it } from 'node:test'

import { toRowNumbers } from '../../src/data/pagination.js'

import { assertDeepEqual } from '../assert.js'

describe('toRowNumbers unit tests', () => {
  it('toRowNumbers', () => {
    const result = toRowNumbers({ size: 14, skip: 4 })
    assertDeepEqual(result, { start: 5, end: 18 })
  })
})
