import { suite, test } from '../../test.js'

import { validPagination } from '../../../src/logic/internal/pagination.js'
import type { PaginationQuery } from '../../../src/logic/pagination.js'
import { invalidPaginationError } from '../../../src/logic/errors.js'
import { expectThrow } from '../controller-error-helper.js'
import { assertDeepEqual } from '../../assert.js'
import { mockFunction } from '../../mock.js'
import type { PaginationValidationResult } from '../../../src/logic/pagination.js'
import { failPaginationValidation } from '../pagination-validation.js'

suite('valid pagination', () => {
  test('return the pagination the query validates to', () => {
    const validatePagination = mockFunction<
      [query: PaginationQuery],
      PaginationValidationResult
    >(() => ({ errorCode: undefined, result: { size: 30, skip: 8 } }))

    const pagination = validPagination(validatePagination, {
      size: '30',
      skip: '8',
    })

    assertDeepEqual(pagination, { size: 30, skip: 8 })
    assertDeepEqual(
      validatePagination.mock.calls.map((call) => call.arguments),
      [[{ size: '30', skip: '8' }]],
    )
  })

  test('throw pagination error for invalid pagination', () => {
    expectThrow(
      () =>
        validPagination(failPaginationValidation, {
          size: 'invalid',
          skip: '8',
        }),
      invalidPaginationError,
    )
  })
})
