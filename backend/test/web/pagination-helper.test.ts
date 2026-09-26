import { suite, test } from '../test.js'

import { validatePagination } from '../../src/web/pagination-helper.js'
import { invalidPaginationError } from '../../src/logic/errors.js'
import { expectThrow } from '../logic/controller-error-helper.js'
import { assertDeepEqual } from '../assert.js'

suite('pagination helper tests', () => {
  test('return pagination', () => {
    const result = validatePagination({ size: '30', skip: '8' })
    assertDeepEqual(result, { size: 30, skip: 8 })
  })

  test('return default pagination', () => {
    const result = validatePagination({ size: undefined, skip: undefined })
    assertDeepEqual(result, { size: 10000, skip: 0 })
  })

  test('throw pagination error for invalid pagination', () => {
    expectThrow(
      () => validatePagination({ size: 'invalid', skip: '8' }),
      invalidPaginationError,
    )
  })
})
