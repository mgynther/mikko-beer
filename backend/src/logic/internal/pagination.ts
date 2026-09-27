import { invalidPaginationError } from '../errors.js'
import type {
  Pagination,
  PaginationQuery,
  ValidatePagination,
} from '../pagination.js'

export function validPagination(
  validatePagination: ValidatePagination,
  query: PaginationQuery,
): Pagination {
  const validationResult = validatePagination(query)
  if (validationResult.errorCode === 'invalid-pagination') {
    throw invalidPaginationError
  }
  return validationResult.result
}
