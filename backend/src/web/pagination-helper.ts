import { validatePagination as doValidatePagination } from '../validation/pagination.js'
import type { PaginationRequest } from '../validation/pagination.js'

import type { Pagination } from '../logic/pagination.js'
import { invalidPaginationError } from '../logic/errors.js'

export function validatePagination(pagination: PaginationRequest): Pagination {
  const validationResult = doValidatePagination(pagination)
  if (validationResult.errorCode === 'invalid-pagination') {
    throw invalidPaginationError
  }
  return validationResult.result
}
